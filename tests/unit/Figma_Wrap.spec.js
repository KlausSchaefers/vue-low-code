import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'

import * as Util from '../../src/qux/core/ExportUtil'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'
import * as TestUtil from './TestUtil'

import figmaWrap from './data/figmaWrap.json'

test('Test Figma Warp', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaWrap.id, figmaWrap)

  /**
   * Check if transform works correctly
   */
  let t = new ModelTransformer(app, {
    css: {
      grid: true
    }
  })
  let model = t.transform()

  expect(model).not.toBeNull()

  let screen = model.screens[0]

  console.debug(TestUtil.print(screen))

  let cntr = TestUtil.findElementsByName(screen, 'WrapCntr')[0]
  expect(Util.isFixedHorizontal(cntr)).toBe(true)
  expect(Util.hasMinMaxWdith(cntr)).toBe(true)
  expect(Util.isLayoutWrap(cntr)).toBe(true)


  let autoCntr = TestUtil.findElementsByName(screen, 'WrapeAutoCntr')[0]
  expect(Util.isFixedHorizontal(autoCntr)).toBe(true)
  expect(Util.hasMinMaxWdith(autoCntr)).toBe(true)
  // the auto layout will overwite the wrap! The Flat2Tree will ignore the style.layout
  expect(Util.isLayoutAutoHorizontal(autoCntr)).toBe(true)
  /**
   * Still the wrao is there!
   */
  expect(Util.isWrappedContainer(autoCntr)).toBe(true)

  let compressed = new CSSOptimizer().runTree(model)
  let classes = new CSSFactory().generate(compressed)

  // test css a little
  let wrapCSS = TestUtil.findCSSBySelector(classes, '.WrapCntr')[0]
  expect(wrapCSS.code.indexOf('min-width: 500px;')).toBeGreaterThan(0)
  expect(wrapCSS.code.indexOf('max-width: 1200px')).toBeGreaterThan(0)
  expect(wrapCSS.code.indexOf('display: flex')).toBeGreaterThan(0)

  //console.debug(wrapCSS.code)

});



