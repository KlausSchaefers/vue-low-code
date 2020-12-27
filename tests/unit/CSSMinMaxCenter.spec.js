
import app from './data/minMaxCenter.json'
import ModelTransformer from '../../src/qux/core/ModelTransformer'
import * as TestUtil from './TestUtil'

import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'
import CSSPosition from '../../src/qux/core/CSSPosition'

test('Test min max center', () => {

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
  expect(tree.screens.length).toBe(4)

  /**
   * Now lets check what is wrong with the margins
   */
  let compressed = new CSSOptimizer().runTree(tree)
  let classes = new CSSFactory().generate(compressed)

  let minMaxCenter = TestUtil.findCSSBySelector(classes, '.MinMaxCenterCntr')[0]
  let fixedCenter = TestUtil.findCSSBySelector(classes, '.FixedCenterCntr')[0]
  let reponsiveCenter = TestUtil.findCSSBySelector(classes, '.ResponsiveCenterCntr')[0]

  /** They should have the same margins! */
  expect(minMaxCenter).not.toBeNull()
  expect(minMaxCenter.code.indexOf('margin-right: auto')).toBeGreaterThan(0)
  expect(minMaxCenter.code.indexOf('margin-left: auto;')).toBeGreaterThan(0)
  expect(minMaxCenter.code.indexOf('width: 70%')).toBeGreaterThan(0)
  expect(minMaxCenter.code.indexOf('min-width: 400px')).toBeGreaterThan(0)
  expect(minMaxCenter.code.indexOf('max-width: 1200px')).toBeGreaterThan(0)

  expect(fixedCenter).not.toBeNull()
  expect(fixedCenter.code.indexOf('margin-right: auto')).toBeGreaterThan(0)
  expect(fixedCenter.code.indexOf('margin-left: auto;')).toBeGreaterThan(0)
  expect(fixedCenter.code.indexOf('width: 70%')).toBeGreaterThan(0)

  expect(reponsiveCenter).not.toBeNull()
  expect(reponsiveCenter.code.indexOf('margin-right: auto')).toBeGreaterThan(0)
  expect(reponsiveCenter.code.indexOf('margin-left: auto;')).toBeGreaterThan(0)
  expect(reponsiveCenter.code.indexOf('width: 70%')).toBeGreaterThan(-1)

});