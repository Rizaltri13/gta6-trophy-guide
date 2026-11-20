// Leonida Platinum — gta6-trophy-guide-01 entry program (Node 22, stdlib only).
//
// The entry is the static app in ./app plus the screenshots in ./screenshots.
// This program hands it in: it copies both folders into the output directory
// and writes /output/dossier.json with the kit's vendored library, exactly as
// the scorer rebuilds it. Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// vendor/makefun-frontend.ts is the kit's copy, unchanged — the scorer
// requires the dossier to be byte for byte what its own copy writes, so
// leave that file alone.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the folder this file lives in.
const root = fileURLToPath(new URL('.', import.meta.url));
// The grader sets /output; outside it, MAKEFUN_OUTPUT_DIR stands in.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale file can never ride along.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// The guide itself: every static file under app/ (index, styles, modules,
// the trophy data). The app works offline from these files alone.
cpSync(join(root, 'app'), join(outDir, 'app'), { recursive: true });

// The screenshots: 3 or 4 real renders of the app's own code, the first by
// name being the cover the judge sees largest.
if (existsSync(join(root, 'screenshots'))) {
  cpSync(join(root, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The dossier the judge reads: screenshots first, then the Load block and the
// source outline. The caps mirror the gate's own limits (reference/gate.json
// via the kit): at most 4 screenshots of 256 KiB, app/ at most 993 entries
// and 48 MiB, and the dossier text at most 163,840 bytes.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log(`Leonida Platinum handed in to ${outDir}`);
