import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

test('a changed imported stylesheet gets a new bundled CSS URL', () => {
    const directory = mkdtempSync(join(tmpdir(), 'pseudonym-css-'))
    const script = fileURLToPath(new URL('../scripts/build-styles.mjs', import.meta.url))
    try {
        mkdirSync(join(directory, 'style'))
        mkdirSync(join(directory, 'output/style'), { recursive: true })
        writeFileSync(join(directory, 'style/style.css'), "@import 'settings.css';\nbody { margin: 0; }")
        const build = (css) => {
            writeFileSync(join(directory, 'style/settings.css'), css)
            writeFileSync(join(directory, 'output/index.html'), '<link href="style/style.css">')
            execFileSync(process.execPath, [script, 'output'], { cwd: directory })
            const html = readFileSync(join(directory, 'output/index.html'), 'utf8')
            const filename = html.match(/href="([^"]+)"/)[1]
            const bundle = readFileSync(join(directory, 'output', filename), 'utf8')
            assert.ok(bundle.includes(css))
            assert.ok(!bundle.includes('@import'))
            return filename
        }
        const first = build('#settings-menu { gap: 20px; }')
        assert.equal(build('#settings-menu { gap: 20px; }'), first)
        assert.notEqual(build('#settings-menu { gap: 24px; }'), first)
    } finally {
        rmSync(directory, { recursive: true, force: true })
    }
})
