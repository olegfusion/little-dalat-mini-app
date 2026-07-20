# Little DaLat — Menu Data

## Files

| File | Format | Purpose |
|------|--------|---------|
| `menu-complete.json` | JSON (945 lines) | Full menu with all data (56 items, 3 languages, descriptions, variants, photos) |
| `menu-edit.json` | JSON (flat) | Simplified format for editing names, prices, descriptions |

## How to Edit

### Editing `menu-edit.json`

1. Open `menu-edit.json` in any text editor
2. Each item has fields: `id`, `category`, `price`, `vn`, `en`, `ru`, `desc_vn`, `desc_en`, `desc_ru`
3. For items with variants: `variants_vn`, `variants_en` list the options
4. For variant descriptions: text is separated by `||` (first = variant 1, second = variant 2, etc.)
5. Save the file and notify to import changes

### Photo Files

All photos are in `../Ảnh Menu/` directory organized by category subfolder.

### Description Source

Full descriptions in original format: `../google-maps-descriptions.txt`
