#!/usr/bin/env python3
"""Embed branded PNG icons into brandAssets.ts as data URIs for reliable SPFx loading."""

from __future__ import annotations

import base64
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "constants" / "brandAssets.ts"
ICON_CANDIDATES = {
    "ENTERPRISE_CLASSIFIEDS_BRAND_ICON_URL": (
        ROOT / "src" / "assets" / "images" / "enterprise-classifieds-icon-96.png",
        ROOT / "sharepoint" / "app-icon.png",
        ROOT / "assets" / "brand" / "app-icon.png",
    ),
    "ENTERPRISE_CLASSIFIEDS_NAV_ICON_URL": (
        ROOT / "src" / "assets" / "images" / "enterprise-classifieds-icon-nav.png",
        ROOT / "src" / "assets" / "images" / "enterprise-classifieds-icon-96.png",
        ROOT / "sharepoint" / "app-icon.png",
    ),
}


def load_png_bytes(candidates: tuple[Path, ...]) -> bytes:
    for candidate in candidates:
        if candidate.exists():
            return candidate.read_bytes()
    raise SystemExit(
        "Missing icon file. Expected one of:\n  " + "\n  ".join(str(p) for p in candidates)
    )


def to_data_uri(png_bytes: bytes) -> str:
    encoded = base64.b64encode(png_bytes).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def main() -> None:
    brand_uri = to_data_uri(load_png_bytes(ICON_CANDIDATES["ENTERPRISE_CLASSIFIEDS_BRAND_ICON_URL"]))
    nav_uri = to_data_uri(load_png_bytes(ICON_CANDIDATES["ENTERPRISE_CLASSIFIEDS_NAV_ICON_URL"]))

    content = f"""/** Branded Enterprise Classifieds icons — embedded data URIs. Regenerate via `npm run assets:icons`. */
export const ENTERPRISE_CLASSIFIEDS_BRAND_ICON_URL: string =
  '{brand_uri}';

/** Navigation/header chrome icon (falls back to tile artwork). */
export const ENTERPRISE_CLASSIFIEDS_NAV_ICON_URL: string =
  '{nav_uri}';
"""

    OUT.write_text(content, encoding="utf-8")
    print(f"Updated {OUT.relative_to(ROOT)} (embedded {len(brand_uri)} + {len(nav_uri)} chars)")


if __name__ == "__main__":
    main()
