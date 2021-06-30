import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'

import * as Util from '../../src/qux/core/ExportUtil'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'
import * as TestUtil from './TestUtil'

import figmaSpaceBetween from './data/figmaSpaceBetween.json'

test('Test SpaceBetween ', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaSpaceBetween.id, figmaSpaceBetween)

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

  let spaceBetween = TestUtil.findElementsByName(screen, 'SpaceBetween')[0]

  expect(Util.isFixedHorizontal(spaceBetween)).toBe(false)
  expect(spaceBetween.layout.justifyContent).toBe('space-between')
  expect(Util.isAutoLayoutSpaceBetween(spaceBetween)).toBe(true)
  expect(spaceBetween.layout.itemSpacing).toBe(10)

  let gap = TestUtil.findElementsByName(screen, 'Gap')[0]
  expect(Util.isFixedHorizontal(gap)).toBe(false)
  expect(gap.layout.justifyContent).toBe('flex-start')
  expect(Util.isAutoLayoutSpaceBetween(gap)).toBe(false)
  expect(gap.layout.itemSpacing).toBe(10)

  let compressed = new CSSOptimizer().runTree(model)
  let classes = new CSSFactory().generate(compressed)

  // test css a little
  let spaceBetweenCSS = TestUtil.findCSSBySelector(classes, '.SpaceBetween')[0]
  expect(spaceBetweenCSS.code.indexOf('justify-content: space-between;')).toBeGreaterThan(0)
  expect(spaceBetweenCSS.code.indexOf('gap:')).toBe(-1)
  //expect(wrapCSS.code.indexOf('max-width: 1200px')).toBeGreaterThan(0)
  //expect(wrapCSS.code.indexOf('display: flex')).toBeGreaterThan(0)

  let gapCSS = TestUtil.findCSSBySelector(classes, '.Gap')[0]
  expect(gapCSS.code.indexOf('justify-content: flex-start;')).toBeGreaterThan(0)
  expect(gapCSS.code.indexOf('gap: 10px;')).toBeGreaterThan(0)

  //console.debug(wrapCSS.code)

});



