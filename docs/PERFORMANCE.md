# Performance changes

- Generated 59 WebP assets: 43,891,333 bytes of source images became 13,852,712 bytes (68% smaller). Original photographs remain in public/images for recovery and existing links. These are asset sizes, not a measured page-speed score.
- Local and Cloudinary menu images now use responsive Next.js image optimization. Other existing image hosts retain their original fallback behavior.
- The welcome screen retains sign-in, signup and guest access. The artificial 1.8-second delay is removed; page content can render behind the welcome overlay while the session is checked. The timeout now clears the page visibility marker.
- The cart and meal editor load when requested. The cart stays mounted after first opening so closing it to edit an item preserves editor state.
- Homepage gallery/preview data is selected on the server instead of importing the complete menu catalogue into those client components.
- Public settings retain one database subscription across public-page navigation.
- Checkout reads unique menu records in one batch and sends both email notifications concurrently. Server price and availability validation, separate order lines, and email failure status are retained.

## Local commands

Use Node.js 22 or newer (required by the existing Firebase Admin dependency), then run:

```sh
npm ci
npm run lint
npx tsc --noEmit
node scripts/verify-orders.mjs
npm run build
```

The checkout verification uses mocks and never submits real orders or sends real emails. It checks database pricing, repeated meal lines, unavailable meals, malformed items and email failures.

`node scripts/optimize-images.mjs` generates web versions of new large images and updates matching source references. It preserves originals and pre-existing WebP files. The generated asset mapping is recorded in image-optimization-results.json.

The production build needs the restaurant's Firebase, Cloudinary and email environment configuration. No credentials are included in this folder. Live account, guest checkout and admin flows still need verification against the configured project before deployment.

## Verification result

- TypeScript: passed with Node 24 and the exact package-lock dependencies.
- Checkout regression checks: passed.
- Image validation: all 59 generated WebP files decoded successfully, and all originals remain present. Representative food/hero images were visually compared.
- Repeat image generation: preserved the same 59 mappings and byte totals.
- Production build: compilation and TypeScript passed; page-data collection stopped because FIREBASE_ADMIN_PROJECT_ID is absent. Live performance and complete checkout/admin flows have not been measured or verified against production.

## Faster menu editing

- Menu saves close after Firestore confirms the write; old Cloudinary image cleanup runs independently.
- New menu photos larger than 200 KB are resized to at most 1600 px and converted to WebP before upload. Compression overlaps the upload-authorization request. Unsupported conversion or a larger result falls back to the original file.
- The menu manager requests 80 px thumbnails. The editor uses a responsive optimized preview for local and Cloudinary images, while preserving local file previews and other image hosts.
- Regression verification: `node scripts/verify-menu-edits.mjs` covers text-only edits, deferred cleanup, rejected writes, resize/compression and conversion fallback. Tests use mocks; live timing still requires the configured Firebase project.
