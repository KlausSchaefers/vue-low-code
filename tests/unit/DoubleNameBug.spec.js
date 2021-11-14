import DoubleNameBug from './data/DoubleNameBug.json'

import ModelTransformer from '../../src/qux/core/ModelTransformer'
import * as TestUtil from './TestUtil'

test('Test Emdedding', async () => {

  let t = new ModelTransformer(DoubleNameBug, {
    css: {
      grid: true
    }
  })
  let model = t.transform()

  expect(model).not.toBeNull()
  
  let screen = model.screens[0]
  console.debug(TestUtil.print(screen))


});