import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const directory = process.argv[2]
if (!directory) throw new Error('Expected the staging directory')

// Bundle local imports so cached child styles cannot outlive a new release.
const css = readFileSync('style/style.css', 'utf8').replace(
    /@import '([^']+)';/g,
    (_, filename) => readFileSync(join('style', filename), 'utf8'),
)
const hash = createHash('sha256').update(css).digest('hex').slice(0, 12)
const filename = `style/style.${hash}.css`
writeFileSync(join(directory, filename), css)
const htmlPath = join(directory, 'index.html')
writeFileSync(htmlPath, readFileSync(htmlPath, 'utf8').replace('style/style.css', filename))
