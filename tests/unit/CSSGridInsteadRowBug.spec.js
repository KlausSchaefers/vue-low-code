
import app from './data/rowAndGridErrors.json'
import ModelTransformer from '../../src/qux/core/ModelTransformer'
import * as TestUtil from './TestUtil'

import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'

test('Test Grid', () => {

  let t = new ModelTransformer(app, {
    css: {
      grid: true
    }
  })
  let tree = t.transform()

  expect(tree).not.toBeNull()
  expect(tree.screens.length).toBe(5)

  /**
   * Get the copy on the other screen and make sure we have the same width
   */
  let q16 = TestUtil.findScreen(tree, 'Question16')
  expect(q16).not.toBeNull()

  /**
   * Now lets check what is wrong with the margins
   */
  let compressed = new CSSOptimizer().runTree(tree)
  let classes = new CSSFactory().generate(compressed)

  let css16 = TestUtil.findCSSBySelector(classes, '.Question16')[0]

  /** They should have a grid, becasue there is a an overlap */
  expect(css16).not.toBeNull()
  expect(css16.code.indexOf('display: grid')).toBeGreaterThan(0)


});

test('Test Row', () => {

  /**
   * We remove the over lap, this will get a nice row layout
   */
  delete app.widgets.w11938
  app.screens.s11924.children = app.screens.s11924.children.filter(c => c !== 'w11938')

  let t = new ModelTransformer(app, {
    css: {
      grid: true
    }
  })
  let tree = t.transform()

  expect(tree).not.toBeNull()
  expect(tree.screens.length).toBe(5)

  /**
   * Get the copy on the other screen and make sure we have the same width
   */
  let q16 = TestUtil.findScreen(tree, 'Question16')
  expect(q16).not.toBeNull()

  /**
   * Now lets check what is wrong with the margins
   */
  let compressed = new CSSOptimizer().runTree(tree)
  let classes = new CSSFactory().generate(compressed)

  let css16 = TestUtil.findCSSBySelector(classes, '.Question16')[0]

  /** They should have a grid, becasue there is a an overlap */
  expect(css16).not.toBeNull()
  expect(css16.code.indexOf('display: flex')).toBeGreaterThan(0)
  expect(css16.code.indexOf('display: grid')).toBe(-1)

});

