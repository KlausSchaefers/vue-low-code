import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'

import * as TestUtil from './TestUtil'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'

import * as Util from '../../src/qux/core/ExportUtil'

import fixedFooter from './data/fixedFooter.json'

test('Test Auto layout with single label', async () => {


  /**
   * Check if transform works correctly
   */
  let t = new ModelTransformer(fixedFooter)
  let model = t.transform()

  let compressed = new CSSOptimizer().runTree(model)
  let classes = new CSSFactory().generate(compressed)

  expect(model).not.toBeNull()

  let screen = model.screens[1]
  expect(screen.name).toBe('Home')
  expect(screen.parent).toBeUndefined()
  expect(screen.cssSelector).not.toBe('.Home .Home')
  console.debug(screen.cssSelector)

  //console.debug(TestUtil.print(screen))


  let home = TestUtil.findCSSBySelector(classes, '.Home').find(cls => cls.type === 'screen')
  expect(home).not.toBeUndefined()

  console.debug(home)

});