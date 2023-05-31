import ModelTransformer from '../../src/qux/core/ModelTransformer'
import reaterBug from './data/ReaterBug.json'
import * as Util from '../../src/qux/core/ExportUtil'
import * as TestUtil from './TestUtil'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'

test('Test Repeater Bug', () => {

  /**
   * Check that group is copied
   */

  const t = new ModelTransformer(reaterBug, {
    css: {
      grid: true
    }
  })
  const model = t.transform()

  expect(model).not.toBeNull()

  const start = model.screens[0]
  console.debug(TestUtil.print(start))


  const grid = TestUtil.findOneElementsByName(start, "Grid")
  expect(grid.children.length).toBe(1)
  expect(grid.children[0].name).toBe("GridWrapper")

});