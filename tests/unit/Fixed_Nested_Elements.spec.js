import ModelTransformer from '../../src/qux/core/ModelTransformer'
import app from './data/fixedNestedElements.json'

import * as TestUtil from './TestUtil'


test('Test Fixed', () => {

  let t = new ModelTransformer(app)
  let model = t.transform()

  expect(model.screens.length).toBe(1)

  let screen = model.screens.find(s => s.id === 's10000')
  expect(screen).not.toBe(null)

  console.debug(TestUtil.print(screen))

  expect(screen.children.length).toBe(2)
  expect(screen.fixedChildren.length).toBe(1)
  expect(screen.fixedChildren[0].children.length).toBe(2)

  let fixedCntr = screen.fixedChildren[0]
  expect(fixedCntr.x).toBe(88)
  expect(fixedCntr.y).toBe(364)

  let fixedChild1 = TestUtil.findElementsByName(fixedCntr, 'FixedChild1')[0]
  expect(fixedChild1).not.toBeNull()
  expect(fixedChild1.y).toBe(20)

});

