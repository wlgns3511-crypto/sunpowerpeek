#!/usr/bin/env python3
"""
Expand SunPowerPeek ZIP data from 612 → 30,000+ using ZipPeek DB + NREL API.

Strategy:
1. Read all ZIPs from zippeek.db (32,446 entries)
2. Filter to 50 US states only (exclude territories like PR, GU, VI, AS, MP)
3. For each ZIP, use state-level solar data as baseline
4. Call NREL Solar Resource API for more accurate local sun hours
5. Calculate system costs, savings, payback based on local data
6. Insert into sunpowerpeek's solar.db

NREL API: https://developer.nrel.gov/api/solar/solar_resource/v1
- Free tier: 1,000 requests/hour
- Input: address (ZIP code)
- Output: avg_ghi, avg_dni, avg_lat_tilt (peak sun hours proxy)

Usage:
  python3 scripts/expand-zips.py              # Full run with NREL API
  python3 scripts/expand-zips.py --state-only  # Use state data only (no API)
  python3 scripts/expand-zips.py --batch 1000  # Process N ZIPs then stop
"""

import sqlite3
import os
import sys
import re
import time
import json
import urllib.request
import urllib.error

NREL_API_KEY = "KQsvwDH895xuKyOzvTaoxrrhCTqZ2hLEqIKlMEvx"
NREL_URL = "https://developer.nrel.gov/api/solar/solar_resource/v1.json"

SUNPOWER_DB = os.path.join(os.path.dirname(__file__), '..', 'data', 'solar.db')
ZIPPEEK_DB = os.path.join(os.path.dirname(__file__), '..', '..', 'zippeek', 'data', 'zippeek.db')

# Progress file to resume interrupted runs
PROGRESS_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'expand_progress.json')

US_STATES = {
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
    'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
}


def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def load_state_data(db_path):
    """Load state solar data from sunpowerpeek DB."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    rows = conn.execute('SELECT * FROM states').fetchall()
    conn.close()
    return {r['abbr']: dict(r) for r in rows}


def load_zippeek_data(db_path):
    """Load all US ZIP codes from zippeek DB."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        'SELECT zip_code, city, state FROM zips ORDER BY zip_code'
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows if r['state'] in US_STATES]


def load_existing_zips(db_path):
    """Load already-existing ZIP codes from sunpowerpeek DB."""
    conn = sqlite3.connect(db_path)
    rows = conn.execute('SELECT zip_code FROM zip_solar').fetchall()
    conn.close()
    return {r[0] for r in rows}


def load_progress():
    """Load progress from previous run."""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"completed_zips": [], "nrel_cache": {}}


def save_progress(progress):
    """Save progress for resume."""
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f)


def fetch_nrel_solar(zip_code, api_key):
    """Fetch solar resource data from NREL API for a ZIP code."""
    url = f"{NREL_URL}?api_key={api_key}&address={zip_code}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            if 'outputs' in data:
                outputs = data['outputs']
                # avg_ghi = Global Horizontal Irradiance (annual avg kWh/m²/day)
                # avg_lat_tilt = optimal tilt irradiance (best proxy for panel output)
                avg_ghi = outputs.get('avg_ghi', {}).get('annual', 0)
                avg_lat_tilt = outputs.get('avg_lat_tilt', {}).get('annual', 0)
                # Use lat_tilt as peak sun hours (more accurate for panels)
                peak_sun = avg_lat_tilt if avg_lat_tilt > 0 else avg_ghi
                return round(peak_sun, 1)
    except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, KeyError) as e:
        print(f"  NREL API error for {zip_code}: {e}")
    except Exception as e:
        print(f"  Unexpected error for {zip_code}: {e}")
    return None


def calculate_solar_data(zip_code, city, state_abbr, state_data, peak_sun_hours=None):
    """Calculate solar metrics for a ZIP code based on state data + local sun hours."""
    sd = state_data[state_abbr]

    # Use NREL sun hours if available, otherwise use state average
    sun_hours = peak_sun_hours if peak_sun_hours else sd['avg_sun_hours']

    # System cost: scale by state's avg cost per watt × 6kW
    cost_per_watt = sd['avg_system_cost_per_watt']
    system_cost = round(cost_per_watt * 6000)

    # Annual production: sun_hours × 365 × 6kW × 0.8 (system efficiency)
    annual_kwh = round(sun_hours * 365 * 6 * 0.8)

    # Annual savings: production × electricity rate
    electricity_rate = sd['avg_electricity_rate'] / 100  # cents to dollars
    annual_savings = round(annual_kwh * electricity_rate)

    # Net cost after federal ITC (30%) + state credits
    net_cost = system_cost * (1 - sd['federal_tax_credit_pct'] / 100)
    if sd['state_tax_credit'] > 0:
        net_cost *= (1 - sd['state_tax_credit'] / 100)
    net_cost -= sd['state_rebate']
    net_cost = max(net_cost, 0)

    # Payback period
    payback = round(net_cost / annual_savings, 1) if annual_savings > 0 else 99

    # CO2 offset: avg 0.855 lbs CO2 per kWh → tons
    co2_tons = round(annual_kwh * 0.855 / 2000, 1)

    slug = f"{zip_code}-{slugify(city)}-{state_abbr.lower()}-solar"

    return {
        'zip_code': zip_code,
        'city': city,
        'state': state_abbr,
        'slug': slug,
        'peak_sun_hours': round(sun_hours, 1),
        'system_cost_6kw': system_cost,
        'annual_production_kwh': annual_kwh,
        'annual_savings': annual_savings,
        'payback_years': payback,
        'co2_offset_tons': co2_tons,
    }


def main():
    state_only = '--state-only' in sys.argv
    batch_limit = None
    for i, arg in enumerate(sys.argv):
        if arg == '--batch' and i + 1 < len(sys.argv):
            batch_limit = int(sys.argv[i + 1])

    print("=== SunPowerPeek ZIP Expansion ===\n")

    # Verify paths
    if not os.path.exists(ZIPPEEK_DB):
        print(f"ERROR: ZipPeek DB not found at {ZIPPEEK_DB}")
        sys.exit(1)
    if not os.path.exists(SUNPOWER_DB):
        print(f"ERROR: SunPowerPeek DB not found at {SUNPOWER_DB}")
        sys.exit(1)

    # Load data
    print("Loading state solar data...")
    state_data = load_state_data(SUNPOWER_DB)
    print(f"  {len(state_data)} states loaded")

    print("Loading ZipPeek data...")
    all_zips = load_zippeek_data(ZIPPEEK_DB)
    print(f"  {len(all_zips)} US ZIP codes found")

    print("Loading existing sunpowerpeek ZIPs...")
    existing = load_existing_zips(SUNPOWER_DB)
    print(f"  {len(existing)} already in database")

    # Filter out existing
    new_zips = [z for z in all_zips if z['zip_code'] not in existing]
    print(f"  {len(new_zips)} new ZIPs to add")

    if batch_limit:
        new_zips = new_zips[:batch_limit]
        print(f"  Batch limited to {batch_limit}")

    if not new_zips:
        print("Nothing to do!")
        return

    # Load progress for NREL cache
    progress = load_progress()
    nrel_cache = progress.get('nrel_cache', {})

    # Connect to sunpowerpeek DB
    conn = sqlite3.connect(SUNPOWER_DB)

    inserted = 0
    nrel_calls = 0
    nrel_hits = 0
    errors = 0

    print(f"\nProcessing {len(new_zips)} ZIPs...")
    print(f"  Mode: {'state-only (no API)' if state_only else 'NREL API + state fallback'}\n")

    for i, z in enumerate(new_zips):
        zip_code = z['zip_code']
        city = z['city']
        state_abbr = z['state']

        if state_abbr not in state_data:
            # DC or territory without solar data - skip
            if state_abbr == 'DC':
                # Use Maryland data for DC
                pass
            else:
                continue

        # Get sun hours
        peak_sun = None
        if not state_only:
            # Check cache first
            if zip_code in nrel_cache:
                peak_sun = nrel_cache[zip_code]
                nrel_hits += 1
            else:
                peak_sun = fetch_nrel_solar(zip_code, NREL_API_KEY)
                if peak_sun:
                    nrel_cache[zip_code] = peak_sun
                    nrel_calls += 1
                    # Rate limit: 1000/hour = ~16/sec, be safe at 5/sec
                    if nrel_calls % 5 == 0:
                        time.sleep(1.0)
                    # Save progress every 100 API calls
                    if nrel_calls % 100 == 0:
                        progress['nrel_cache'] = nrel_cache
                        save_progress(progress)
                        print(f"  Progress saved ({nrel_calls} API calls, {inserted} inserted)")

        # Use DC→MD mapping
        effective_state = 'MD' if state_abbr == 'DC' else state_abbr

        try:
            row = calculate_solar_data(zip_code, city, effective_state, state_data, peak_sun)
            # Override state back to DC if needed
            if state_abbr == 'DC':
                row['state'] = 'DC'

            conn.execute('''
                INSERT OR IGNORE INTO zip_solar
                (zip_code, city, state, slug, peak_sun_hours, system_cost_6kw,
                 annual_production_kwh, annual_savings, payback_years, co2_offset_tons)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                row['zip_code'], row['city'], row['state'], row['slug'],
                row['peak_sun_hours'], row['system_cost_6kw'],
                row['annual_production_kwh'], row['annual_savings'],
                row['payback_years'], row['co2_offset_tons'],
            ))
            inserted += 1
        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"  Error inserting {zip_code}: {e}")

        if (i + 1) % 1000 == 0:
            conn.commit()
            print(f"  [{i+1}/{len(new_zips)}] inserted={inserted} nrel_api={nrel_calls} cache_hits={nrel_hits} errors={errors}")

    conn.commit()
    conn.close()

    # Save final progress
    progress['nrel_cache'] = nrel_cache
    save_progress(progress)

    # Final stats
    total = len(existing) + inserted
    print(f"\n=== Done ===")
    print(f"  New ZIPs inserted: {inserted}")
    print(f"  NREL API calls: {nrel_calls}")
    print(f"  NREL cache hits: {nrel_hits}")
    print(f"  Errors: {errors}")
    print(f"  Total ZIPs in DB: {total}")


if __name__ == '__main__':
    main()
