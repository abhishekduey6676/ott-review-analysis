"""Build a SQLite copy of the aggregate tables that can be shared publicly."""

import json
from pathlib import Path
import sqlite3

OUT = Path(__file__).resolve().parents[1] / "reports" / "analysis"
# Only these known summary files are accepted. No review text or review IDs.
TABLES = (
    "shared_quality",
    "theme_summary",
    "weekly_themes",
    "within_app_monthly_themes",
    "context_cooccurrence",
    "sensitivity",
    "rating_standardization",
    "classification_metrics",
    "daily_coverage",
)


def sql_type(records, name):
    values = [row[name] for row in records if row[name] is not None]
    if values and all(isinstance(value, int) for value in values):
        return "INTEGER"
    if values and all(isinstance(value, (int, float)) for value in values):
        return "REAL"
    return "TEXT"


def main():
    with sqlite3.connect(OUT / "ott_summary.sqlite") as db:
        db.execute("BEGIN")
        for name in TABLES:
            records = json.loads((OUT / f"{name}.json").read_text(encoding="utf-8"))
            columns = list(records[0])
            if not all(column.isascii() and column.replace("_", "").isalnum() for column in columns):
                raise ValueError(f"Unexpected column in {name}")
            if any(set(row) != set(columns) for row in records):
                raise ValueError(f"Inconsistent columns in {name}")
            schema = ", ".join(f'"{c}" {sql_type(records, c)}' for c in columns)
            db.execute(f'DROP TABLE IF EXISTS "{name}"')
            db.execute(f'CREATE TABLE "{name}" ({schema})')
            marks = ",".join("?" for _ in columns)
            db.executemany(f'INSERT INTO "{name}" VALUES ({marks})', ([row[c] for c in columns] for row in records))


if __name__ == "__main__":
    main()
