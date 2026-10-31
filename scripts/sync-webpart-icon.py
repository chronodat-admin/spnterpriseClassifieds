#!/usr/bin/env python3
"""Update web part manifest iconImageUrl without parsing JSON comments."""

from __future__ import annotations

import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "src" / "webparts" / "enterpriseClassifieds" / "EnterpriseClassifiedsWebPart.manifest.json"
ICON = ROOT / "sharepoint" / "app-icon.png"


def main() -> None:
    uri = "data:image/png;base64," + base64.b64encode(ICON.read_bytes()).decode("ascii")
    text = MANIFEST.read_text(encoding="utf-8")

    if '"iconImageUrl"' in text:
        text = re.sub(
            r'"iconImageUrl"\s*:\s*"data:image/png;base64,[^"]*"',
            f'"iconImageUrl": "{uri}"',
            text,
            count=1,
        )
    else:
        text = re.sub(
            r'"officeFabricIconFontName"\s*:\s*"[^"]*"\s*,?\s*\n',
            f'"iconImageUrl": "{uri}",\n',
            text,
            count=1,
        )

    MANIFEST.write_text(text, encoding="utf-8")
    print(f"Updated {MANIFEST.name} ({len(uri)} chars)")


if __name__ == "__main__":
    main()
