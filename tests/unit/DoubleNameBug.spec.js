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
  console.debug(TestUtil.print(screen, e => e.cssSelector))
 
  let shouldBeEmpty = TestUtil.findOneElementsByProp(screen, '.Contact .Contact', 'cssSelector',)
  expect(shouldBeEmpty).toBeUndefined()

  let found1 = TestUtil.findOneElementsByProp(screen, '.Contact .Contact_0', 'cssSelector')
  expect(found1).not.toBeNull()
  expect(found1).not.toBeUndefined()


  let found2 = TestUtil.findOneElementsByProp(screen, '.Contact .Contact_2', 'cssSelector')
  expect(found2).not.toBeNull()
  expect(found2).not.toBeUndefined()
});