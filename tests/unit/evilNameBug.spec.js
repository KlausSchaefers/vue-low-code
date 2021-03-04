import app from './data/evilNamingBug.json'

import ModelTransformer from '../../src/qux/core/ModelTransformer'
import * as TestUtil from './TestUtil'

test('Test Evil Names', async () => {

  let t = new ModelTransformer(app, {
    css: {
      grid: true
    }
  })
  let model = t.transform()

  expect(model).not.toBeNull()

  let overlay = model.screens[2]
  console.debug(TestUtil.print(overlay))

  let password = overlay.children[0].children[1]
  expect(password.name.indexOf('(')).toBeLessThan(0)
  expect(password.cssSelector.indexOf('(')).toBeLessThan(0)
});