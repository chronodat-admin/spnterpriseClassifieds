# Enterprise Classifieds 365 — Brand Assets

Branded app icons in the same Microsoft 365 blue-tile style as Asset Management Hub.

## Regenerate icons

```bash
npm run assets:icons
```

Requires Python 3 and Pillow (`pip install pillow`).

## Outputs

| File | Size | Use |
|------|------|-----|
| `assets/brand/app-icon.png` | 512×512 | Master archive |
| `sharepoint/app-icon.png` | 96×96 | App catalog / `.sppkg` |
| `teams/color.png` | 192×192 | Teams color icon |
| `teams/outline.png` | 32×32 | Teams outline glyph |
| `src/assets/images/enterprise-classifieds-icon-96.png` | 96×96 | In-app tile |
| `src/assets/images/enterprise-classifieds-icon-nav.png` | 96×96 | Nav / header chrome |
| Web part manifest `iconImageUrl` | 96×96 | SharePoint toolbox tile |

Source artwork: `assets/app-icon-source.png`
