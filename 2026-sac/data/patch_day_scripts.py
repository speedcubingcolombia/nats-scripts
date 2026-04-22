#!/usr/bin/env python3
"""
Rewrite volunteers/day{1..4}.cs to add room-coherence scoring.

Changes per AssignStaff line:
  1. Primary-team bonus 500 → 50 (so floating team actively supports).
  2. Insert PersonPropertyScorer(BooleanProperty("compete-d{N}-{slug}"), 300)
     into the scorer list, where N is the day (1-4) and slug matches the
     `Room() == "..."` filter on that line.

This is idempotent — running twice is safe because it matches on "500)"
which no longer exists after the first pass.

Usage:
    uv run scc-scripts/2026-sac/data/patch_day_scripts.py
"""

import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DAY_DIR = SCRIPT_DIR.parent / "volunteers"

ROOM_SLUG = {
    "Zona Amarilla": "amarilla",
    "Zona Azul": "azul",
    "Zona Roja": "roja",
    "Zona Morada (Sala BLD)": "bld",
    "Zona Verde (TARIMA)": "verde",
}

# Scoring: primary team assignment must dominate (team's room-of-the-day wins).
# Cohesion is a secondary tiebreaker that mostly helps the floating team pick
# which main room to support (biased toward where they compete that day).
PRIMARY_BONUS = 500
COHERENCE_BONUS = 100
# Legacy values used to make the patcher idempotent across runs.
_OLD_PRIMARY_VALUES = (500, 50)
_OLD_COHERENCE_VALUES = (100, 300)

# Delegate count per main-room group: 3 (los 3 team leads del team primario
# quedan asignados; avoidConflicts excluye a los que compitan en ese grupo).
# BLD (Sala Morada) sigue con 2 (no está en day{N}.cs main-room AssignStaff).
DELEGATE_COUNT_MAIN = 3
_OLD_DELEGATE_VALUES = (1, 3)


def patch_line(line: str, day_num: int) -> str:
    # Skip comments and non-AssignStaff lines
    if "AssignStaff" not in line:
        return line

    # Find which room this line targets
    room_match = re.search(r'Room\(\)\s*==\s*"([^"]+)"', line)
    if not room_match:
        return line
    room_name = room_match.group(1)
    slug = ROOM_SLUG.get(room_name)
    if not slug:
        print(f"  WARNING: unknown room {room_name!r} on day {day_num}, skipping")
        return line

    # 1) Normalize primary-team bonus to PRIMARY_BONUS.
    primary_pattern = re.compile(
        r'PersonPropertyScorer\(\(NumberProperty\("staff-team"\)\s*==\s*(\d+)\),\s*('
        + "|".join(str(v) for v in _OLD_PRIMARY_VALUES)
        + r')\)'
    )
    updated, _ = primary_pattern.subn(
        lambda m: f'PersonPropertyScorer((NumberProperty("staff-team") == {m.group(1)}), {PRIMARY_BONUS})',
        line,
    )

    # 1b) Bump Delegate count from 1 to DELEGATE_COUNT_MAIN in main-room lines.
    # Each main-room AssignStaff has `Job("Delegate", 1, eligibility=BooleanProperty("stage-lead"))`
    # which we upgrade. BLD lines have different eligibility filters (by team), left untouched.
    delegate_pattern = re.compile(
        r'Job\("Delegate",\s*('
        + "|".join(str(v) for v in _OLD_DELEGATE_VALUES)
        + r'),\s*eligibility=BooleanProperty\("stage-lead"\)\)'
    )
    updated = delegate_pattern.sub(
        f'Job("Delegate", {DELEGATE_COUNT_MAIN}, eligibility=BooleanProperty("stage-lead"))',
        updated,
    )

    # 2) Normalize coherence bonus (if already present) to COHERENCE_BONUS.
    coherence_pattern = re.compile(
        r'(PersonPropertyScorer\(BooleanProperty\("compete-d\d+-[a-z]+"\),\s*)('
        + "|".join(str(v) for v in _OLD_COHERENCE_VALUES)
        + r')(\))'
    )
    updated = coherence_pattern.sub(lambda m: f"{m.group(1)}{COHERENCE_BONUS}{m.group(3)}", updated)

    # 3) Insert coherence scorer after primary if not already there.
    expected_coherence = (
        f'PersonPropertyScorer(BooleanProperty("compete-d{day_num}-{slug}"), {COHERENCE_BONUS})'
    )
    if expected_coherence in updated:
        return updated

    new_primary_pattern = re.compile(
        r'(PersonPropertyScorer\(\(NumberProperty\("staff-team"\)\s*==\s*\d+\),\s*'
        + str(PRIMARY_BONUS)
        + r'\))'
    )
    updated, n_insert = new_primary_pattern.subn(
        lambda m: f"{m.group(1)}, {expected_coherence}",
        updated,
        count=1,
    )
    if not n_insert:
        print(f"  WARNING: could not insert coherence scorer on day {day_num} ({room_name})")
    return updated


def main() -> None:
    for day_num in range(1, 5):
        path = DAY_DIR / f"day{day_num}.cs"
        text = path.read_text()
        new_lines = [patch_line(ln, day_num) for ln in text.splitlines()]
        new_text = "\n".join(new_lines)
        if not new_text.endswith("\n"):
            new_text += "\n"
        if new_text != text:
            path.write_text(new_text)
            print(f"Patched {path.name}")
        else:
            print(f"No changes for {path.name} (already patched?)")


if __name__ == "__main__":
    main()
