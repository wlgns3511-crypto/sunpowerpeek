#!/usr/bin/env python3
"""
Documentation script: Shows how solar comparison pairs are generated.

Note: State comparison pairs are now generated dynamically in lib/db.ts
using getTopComparisonPairs() which queries the states table directly.
This generates all 50*49/2 = 1,225 state pairs automatically.

New page types added:
- /compare/[slug] - 1,225 state comparison pages
- /solar-cities/[state] - 50 state solar city pages
- /incentives/[state] - 50 state incentive pages

Total new pages: ~1,200+
"""

import sqlite3
import os
import itertools

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'solar.db')


def show_stats():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("SELECT slug FROM states ORDER BY state")
    state_slugs = [row[0] for row in c.fetchall()]

    pairs = list(itertools.combinations(state_slugs, 2))
    print(f"Total state solar comparison pairs: {len(pairs)}")
    print(f"Sample pairs:")
    for s1, s2 in pairs[:10]:
        print(f"  {s1}-vs-{s2}-solar")

    c.execute("SELECT COUNT(*) FROM zip_solar")
    zip_count = c.fetchone()[0]
    print(f"\nZIP codes in DB: {zip_count}")
    print(f"Run 'python3 scripts/build-db.py' to rebuild with new ZIP codes (~200 additional)")

    conn.close()


if __name__ == '__main__':
    show_stats()
