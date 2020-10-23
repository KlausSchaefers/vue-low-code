import app from './data/embedding.json'

import ModelTransformer from '../../src/qux/core/ModelTransformer'
import * as TestUtil from './TestUtil'

test('Test Emdedding', async () => {

  let t = new ModelTransformer(app, {
    css: {
      grid: true
    }
  }, 'LoginBox')
  let model = t.transform()

  expect(model).not.toBeNull()
  expect(model.screens.length).toBe(1)

  let screen = model.screens[0]
  expect(screen.isComponentScreen).toBe(true)

  console.debug(TestUtil.print(screen))


});