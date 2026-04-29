#!/usr/bin/env python3
"""
Import pilot 4-state DSIRE incentives + ALL federal from
data/dsire-state-incentives.json into data/solar.db.

Idempotent: re-running cleans previously-imported rows and re-inserts.
Manual hand-entered rows (source IS NULL) are preserved or upgraded
with source_url where (state, incentive_name) collides.

GSC 0-click crisis pivot — Apr 2026.
"""
import json
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "data" / "dsire-state-incentives.json"
DB_PATH = ROOT / "data" / "solar.db"

KNOWN_INCORRECT_ROWS = [
    ("UT", "Utah Sales Tax Exemption"),
    ("WA", "Washington Sales Tax Exemption"),
]


def main():
    payload = json.loads(JSON_PATH.read_text())
    meta = payload.pop("_meta", {})

    sources_in_import = sorted(
        {r["source"] for items in payload.values() for r in items}
    )

    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    bad_deleted = 0
    for state, name in KNOWN_INCORRECT_ROWS:
        bad_deleted += cur.execute(
            "DELETE FROM incentives WHERE state=? AND incentive_name=?",
            (state, name),
        ).rowcount

    placeholders = ",".join("?" for _ in sources_in_import)
    prior_deleted = cur.execute(
        f"DELETE FROM incentives WHERE source IN ({placeholders})",
        sources_in_import,
    ).rowcount

    inserted = updated = skipped = 0
    for state_code, items in payload.items():
        for r in items:
            before_total = cur.execute(
                "SELECT COUNT(*) FROM incentives WHERE state=? AND incentive_name=?",
                (state_code, r["name"]),
            ).fetchone()[0]

            cur.execute(
                """
                INSERT INTO incentives
                    (state, incentive_name, type, value, description, expiration,
                     source, source_url, last_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(state, incentive_name) DO UPDATE SET
                    type=excluded.type,
                    value=excluded.value,
                    description=excluded.description,
                    expiration=excluded.expiration,
                    source=excluded.source,
                    source_url=excluded.source_url,
                    last_verified=excluded.last_verified
                WHERE incentives.source IS NULL
                   OR incentives.source = excluded.source
                """,
                (
                    state_code,
                    r["name"],
                    r["type"],
                    r["value"],
                    r["description"],
                    r.get("expiration"),
                    r["source"],
                    r["source_url"],
                    r["last_verified"],
                ),
            )

            after = cur.execute(
                "SELECT source FROM incentives WHERE state=? AND incentive_name=?",
                (state_code, r["name"]),
            ).fetchone()
            if before_total == 0:
                inserted += 1
            elif after and after[0] == r["source"]:
                updated += 1
            else:
                skipped += 1

    con.commit()

    print(
        f"Pre-cleanup: removed {bad_deleted} known-incorrect rows "
        f"(UT/WA fabricated/vague entries)"
    )
    print(
        f"Re-run cleanup: removed {prior_deleted} rows from prior import sources"
    )
    print(
        f"Result: {inserted} inserted / {updated} updated / "
        f"{skipped} skipped (manual rows protected)"
    )

    print("\nDistribution after import:")
    cur.execute(
        """
        SELECT state, COUNT(*) AS n,
               SUM(CASE WHEN source IS NOT NULL THEN 1 ELSE 0 END) AS with_source
        FROM incentives
        WHERE state IN ('ALL', 'TN', 'WA', 'UT', 'AL')
        GROUP BY state
        ORDER BY state
        """
    )
    for row in cur.fetchall():
        print(f"  {row[0]:4s}  {row[1]:3d} rows  ({row[2]} with source_url)")

    print(
        f"\nMeta: vintage={meta.get('vintage')} verified_at={meta.get('verified_at')}"
    )
    con.close()


if __name__ == "__main__":
    main()
