# LEO JEWELS — Brand Logo

This folder is the single source of truth for the site logo. The header,
footer, auth screens and admin sign-in all read the logo from here through
`src/data/brandAssets.ts` — you never need to edit a component or a path.

## How to replace the logo

Drop your approved artwork into this folder using one of these exact names:

| Priority | Filename                  | Notes                                        |
| -------- | ------------------------- | -------------------------------------------- |
| 1        | `leo-jewels-logo.svg`     | Preferred: vector, sharp at every size       |
| 2        | `leo-jewels-logo.png`     | Use a transparent PNG, at least 2× display size |

Then refresh the website. The SVG is used when present, otherwise the PNG.

## Requirements

- Transparent background (PNG or SVG).
- Wide horizontal lockup works best (emblem + wordmark).
- Natural proportions are preserved — the image is never stretched.
- Maximum rendered height is 40px (small), 54px (medium) and 80px (large).
  Width scales automatically from the file's aspect ratio.

## Fallback

If neither file exists (or the file fails to load), the site automatically
renders the original text-based LEO JEWELS lockup. No broken-image icons.

## Do not

- Rename the files.
- Move this folder — `src/data/brandAssets.ts` points at
  `/images/branding/logo/`.
- Add placeholder or generated artwork; the final approved logo only.
