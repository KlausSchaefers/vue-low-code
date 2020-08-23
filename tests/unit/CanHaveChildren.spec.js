import ModelTransformer from '../../src/qux/core/ModelTransformer'
import canHaveChildren from './data/canHaveChildren.json'
import canHaveChildren2 from './data/canHaveChildren2.json'
import * as TestUtil from './TestUtil'

test('Test Rings', () => {

  let t = new ModelTransformer(canHaveChildren, {
    css: {
      grid: true
    }
  })
  let model = t.transform()

  expect(model).not.toBeNull()

  let screen = model.screens[0]
  expect(screen.children.length).toBe(4)
  expect(screen.children[0].type).toBe('RingChart')
  expect(screen.children[1].type).toBe('RingChart')
  expect(screen.children[2].children.length).toBe(1)
  expect(screen.children[2].type).toBe('Button')
  expect(screen.children[3].children.length).toBe(1)
  expect(screen.children[3].type).toBe('Image')

});

test('Test Header', () => {

  let t = new ModelTransformer(canHaveChildren2, {
    css: {
      grid: true
    }
  })
  let model = t.transform()

  expect(model).not.toBeNull()

  let screen = model.screens[0]
  TestUtil.print(screen)

  expect(screen.children.length).toBe(1)

});
