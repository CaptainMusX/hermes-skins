import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { LICENSE_FILES } from '../scripts/license-files.js'

test('native desktop and backend carry complete matching legal materials', () => {
  for (const [source, name] of LICENSE_FILES) {
    const original = fs.readFileSync(new URL(`../${source}`, import.meta.url))
    for (const dir of ['plugin', 'plugin/desktop', 'plugin/dashboard']) {
      assert.deepEqual(fs.readFileSync(new URL(`../${dir}/${name}`, import.meta.url)), original, `${dir}/${name}`)
    }
  }
  const notice = fs.readFileSync(new URL('../third_party/jpeg-js/NOTICE.md', import.meta.url), 'utf8')
  assert.match(notice, /Copyright 2011 notmasteryet/)
  assert.match(notice, /2008, Adobe Systems Incorporated/)
  assert.match(notice, /Apache License, Version 2\.0/)
})
