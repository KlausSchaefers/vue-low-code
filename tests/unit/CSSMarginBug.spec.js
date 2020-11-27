
import app from './data/rowAndGridErrors.json'
import ModelTransformer from '../../src/qux/core/ModelTransformer'
import * as TestUtil from './TestUtil'

import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'
import CSSPosition from '../../src/qux/core/CSSPosition'

test('Test wrong margins', () => {

  /**
   * This error is caused because the screens have different widths!
   */


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
  let q2 = TestUtil.findScreen(tree, 'Question2')
  let e1 = TestUtil.findOneElementsByName(q2, 'A1-1')

  let q3 = TestUtil.findScreen(tree, 'Question3')
  let e2 = TestUtil.findOneElementsByName(q3, 'A1-1')

  expect(e1.x).toBe(e2.x)
  expect(e1.top).toBe(e2.top)
  expect(e1.w).toBe(e2.w)

  expect(e2.x).toBe(271)
  expect(e2.top).toBe(40)


  let position = new CSSPosition({})
  expect(position.getResponsiveRight(e1)).toBe(position.getResponsiveRight(e2))
  expect(position.getResponsiveLeft(e1)).toBe(position.getResponsiveLeft(e2))


  /**
   * Now lets check what is wrong with the margins
   */
  let compressed = new CSSOptimizer().runTree(tree)
  let classes = new CSSFactory().generate(compressed)

  let css1 = TestUtil.findCSSBySelector(classes, '.Question2 .A1-1')[0]
  let css2 = TestUtil.findCSSBySelector(classes, '.Question3 .A1-1')[0]

  /** They should have the same margins! */
  expect(css1).not.toBeNull()
  expect(css1.code.indexOf('margin-right: 9%')).toBeGreaterThan(0)
  expect(css1.code.indexOf('margin-left: 72%;')).toBeGreaterThan(0)


  expect(css2).not.toBeNull()
  expect(css2.code.indexOf('margin-right: 9%')).toBeGreaterThan(0)
  expect(css2.code.indexOf('margin-left: 72%;')).toBeGreaterThan(0)

});

