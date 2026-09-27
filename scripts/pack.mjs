// Packs dist/ into files/Curfew (v<manifest version>).zip — the single
// load-unpacked artifact for the current change. Reads the version from
// manifest.json (single source of truth), strips macOS bloat (dot-underscore
// files, .DS_Store), and deletes any older Curfew zip so files/ holds the
// latest build only.
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const dist = join(root, 'dist')
const filesDir = join(root, 'files')

if (!existsSync(dist)) {
  console.error('dist/ missing — run npm run build first')
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'))
const name = `Curfew (v${manifest.version}).zip`

mkdirSync(filesDir, { recursive: true })
for (const f of readdirSync(filesDir)) {
  if (f.startsWith('Curfew (v') && f.endsWith('.zip')) rmSync(join(filesDir, f))
}

// -X: no extra attributes, -r: recursive, -x: exclude macOS bloat.
execSync(`cd ${JSON.stringify(dist)} && zip -X -r ${JSON.stringify(join(filesDir, name))} . -x '.*' '__MACOSX/*' '.DS_Store'`, { stdio: 'inherit' })
console.log(`packed files/${name}`)
