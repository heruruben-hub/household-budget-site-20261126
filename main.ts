// RumahAnggaran — the hand-in program (Node 22, standard library only).
//
// It copies the site (app/) and its screenshots (screenshots/) from beside
// this file into the output directory and writes dossier.json there with
// the vendored make.fun library, exactly as the kit's starter does. The
// grader runs this program twice and both runs must write the same bytes,
// so there is no timestamp, no randomness and no network here: a plain
// copy and a deterministic dossier build.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps match the gate in the kit's rules: at most 4 screenshots, each
// at most 256 KiB; app/ at most 993 files and directories and 16 MiB;
// the dossier text at most 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
