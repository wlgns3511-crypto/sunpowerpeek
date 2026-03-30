#!/usr/bin/env python3
"""
Enrich existing SunPowerPeek ZIP data with accurate NREL solar irradiance.
Updates peak_sun_hours and recalculates savings/payback for ZIPs that still
have state-level defaults.

NREL API rate limit: 1,000 requests/hour → ~16/sec, we do 3/sec to be safe.

Usage:
  python3 scripts/enrich-nrel.py              # Enrich all (resumes from cache)
  python3 scripts/enrich-nrel.py --batch 1000 # Process N ZIPs then stop
"""

import sqlite3
import os
import sys
import json
import time
import urllib.request
import urllib.error

NREL_API_KEY = "KQsvwDH895xuKyOzvTaoxrrhCTqZ2hLEqIKlMEvx"
NREL_URL = "https://developer.nrel.gov/api/solar/solar_resource/v1.json"

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'solar.db')
CACHE_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'nrel_cache.json')


def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE) as f:
            return json.load(f)
    return {}


def save_cache(cache):
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f)


def fetch_nrel(zip_code):
    url = f"{NREL_URL}?api_key={NREL_API_KEY}&address={zip_code}"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            if 'outputs' in data:
                lat_tilt = data['outputs'].get('avg_lat_tilt', {}).get('annual', 0)
                ghi = data['outputs'].get('avg_ghi', {}).get('annual', 0)
                return round(lat_tilt if lat_tilt > 0 else ghi, 1)
    except Exception as e:
        print(f"  API error {zip_code}: {e}")
    return None


def main():
    batch_limit = None
    for i, arg in enumerate(sys.argv):
        if arg == '--batch' and i + 1 < len(sys.argv):
            batch_limit = int(sys.argv[i + 1])

    print("=== NREL Solar Enrichment ===\n")

    cache = load_cache()
    print(f"Cache: {len(cache)} ZIPs already fetched")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    # Load state data for recalculation
    states = {}
    for r in conn.execute('SELECT * FROM states').fetchall():
        states[r['abbr']] = dict(r)

    # Find ZIPs that need enrichment (sun hours match state default = not enriched)
    zips = conn.execute('''
        SELECT z.zip_code, z.city, z.state, z.peak_sun_hours, s.avg_sun_hours
        FROM zip_solar z JOIN states s ON z.state = s.abbr
        WHERE z.peak_sun_hours = s.avg_sun_hours
        ORDER BY z.zip_code
    ''').fetchall()

    print(f"ZIPs needing enrichment: {len(zips)}")

    # Filter out cached ones (will use cache, no API call needed)
    need_api = [z for z in zips if z['zip_code'] not in cache]
    have_cache = [z for z in zips if z['zip_code'] in cache]
    print(f"  Already in cache: {len(have_cache)}")
    print(f"  Need API call: {len(need_api)}")

    if batch_limit:
        need_api = need_api[:batch_limit]
        print(f"  Batch limited to: {batch_limit}")

    # First, update from cache (instant)
    updated = 0
    for z in have_cache:
        sun = cache[z['zip_code']]
        if sun and sun != z['peak_sun_hours']:
            sd = states.get(z['state'])
            if not sd:
                continue
            annual_kwh = round(sun * 365 * 6 * 0.8)
            rate = sd['avg_electricity_rate'] / 100
            savings = round(annual_kwh * rate)
            net_cost = sd['avg_system_cost_per_watt'] * 6000 * (1 - sd['federal_tax_credit_pct'] / 100)
            if sd['state_tax_credit'] > 0:
                net_cost *= (1 - sd['state_tax_credit'] / 100)
            net_cost -= sd['state_rebate']
            payback = round(max(net_cost, 0) / savings, 1) if savings > 0 else 99
            co2 = round(annual_kwh * 0.855 / 2000, 1)

            conn.execute('''
                UPDATE zip_solar SET peak_sun_hours=?, annual_production_kwh=?,
                annual_savings=?, payback_years=?, co2_offset_tons=?
                WHERE zip_code=?
            ''', (sun, annual_kwh, savings, payback, co2, z['zip_code']))
            updated += 1

    conn.commit()
    print(f"Updated from cache: {updated}")

    # Now fetch from API
    api_calls = 0
    api_updated = 0
    errors = 0

    for i, z in enumerate(need_api):
        zip_code = z['zip_code']
        sun = fetch_nrel(zip_code)
        api_calls += 1

        if sun:
            cache[zip_code] = sun
            sd = states.get(z['state'])
            if sd:
                annual_kwh = round(sun * 365 * 6 * 0.8)
                rate = sd['avg_electricity_rate'] / 100
                savings = round(annual_kwh * rate)
                net_cost = sd['avg_system_cost_per_watt'] * 6000 * (1 - sd['federal_tax_credit_pct'] / 100)
                if sd['state_tax_credit'] > 0:
                    net_cost *= (1 - sd['state_tax_credit'] / 100)
                net_cost -= sd['state_rebate']
                payback = round(max(net_cost, 0) / savings, 1) if savings > 0 else 99
                co2 = round(annual_kwh * 0.855 / 2000, 1)

                conn.execute('''
                    UPDATE zip_solar SET peak_sun_hours=?, annual_production_kwh=?,
                    annual_savings=?, payback_years=?, co2_offset_tons=?
                    WHERE zip_code=?
                ''', (sun, annual_kwh, savings, payback, co2, zip_code))
                api_updated += 1
        else:
            cache[zip_code] = None
            errors += 1

        # Rate limit: 3 requests/sec
        time.sleep(0.35)

        if (i + 1) % 100 == 0:
            conn.commit()
            save_cache(cache)
            print(f"  [{i+1}/{len(need_api)}] api_updated={api_updated} errors={errors}")

    conn.commit()
    save_cache(cache)
    conn.close()

    print(f"\n=== Done ===")
    print(f"  Cache updates: {updated}")
    print(f"  API calls: {api_calls}")
    print(f"  API updates: {api_updated}")
    print(f"  Errors: {errors}")
    print(f"  Total cache size: {len(cache)}")


if __name__ == '__main__':
    main()
