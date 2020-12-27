import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaAutoLayout from './data/figmaAutoFixed.json'
import * as Util from '../../src/qux/core/ExportUtil'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'
import * as TestUtil from './TestUtil'

test('Test Figma Auto Fixed', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaAutoLayout.id, figmaAutoLayout)

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

  let cntr1 = TestUtil.findElementsByName(screen, 'AutoContainer')[0]
  expect(Util.isFixedHorizontal(cntr1)).toBe(false)

  let cntr2 = TestUtil.findElementsByName(screen, 'AutoContainer2')[0]
  expect(Util.isFixedHorizontal(cntr2)).toBe(false)



  let fixed1 = TestUtil.findElementsByName(screen, 'Fixed1')[0]
  expect(fixed1).not.toBeNull()
  expect(Util.isFixedHorizontal(fixed1)).toBe(true)
  expect(Util.isLayoutGrow(fixed1)).toBe(false)

  let grow = TestUtil.findElementsByName(screen, 'Grow')[0]
  expect(grow).not.toBeNull()
  expect(Util.isFixedHorizontal(grow)).toBe(false)
  expect(Util.isLayoutGrow(grow)).toBe(true)



  let compressed = new CSSOptimizer().runTree(model)
  let classes = new CSSFactory().generate(compressed)

  // test css a little
  let growCSS = TestUtil.findCSSBySelector(classes, '.Grow')[0]
  expect(growCSS.code.indexOf('flex-grow: 1')).toBeGreaterThanOrEqual(0)

  let fixedCSS = TestUtil.findCSSBySelector(classes, '.Fixed1')[0]
  expect(fixedCSS.code.indexOf('flex-grow: 1')).toBe(-1)

});



