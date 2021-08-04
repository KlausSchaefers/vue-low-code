import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaAutoRootFill from './data/figmaAutoRootFill.json'
import * as TestUtil from './TestUtil'
import * as Util from '../../src/qux/core/ExportUtil'

import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'


test('Test Auto Root Fill Width', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaAutoRootFill.id, figmaAutoRootFill)

  let t = new ModelTransformer(app)
  let model = t.transform()
  expect(model).not.toBeNull()

  let autoScreen = model.screens.find(s => s.name === 'AutoScreen')
  let recFill = TestUtil.findOneElementsByName(autoScreen, 'RecFill')
  let recFixed = TestUtil.findOneElementsByName(autoScreen, 'RecFixed')
  expect(Util.isFixedHorizontal(recFixed)).toBe(true)
  expect(Util.isFixedHorizontal(recFill)).toBe(false)


  let absScreen = model.screens.find(s => s.name === 'AbsScreen')
  let recFill2 = TestUtil.findOneElementsByName(absScreen, 'RecFill')
  let recFixed2 = TestUtil.findOneElementsByName(absScreen, 'RecFixed')
  expect(Util.isFixedHorizontal(recFixed2)).toBe(true)
  expect(Util.isFixedHorizontal(recFill2)).toBe(false)


  let compressed = new CSSOptimizer().runTree(model)
  let classes = new CSSFactory().generate(compressed)

  // test css a little
  let cssRecFill = TestUtil.findCSSBySelector(classes, '.AutoScreen .RecFill')[0]
  console.debug(cssRecFill.code)
  assertCSS(cssRecFill, 'width: 100%')
  assertNotCSS(cssRecFill, 'box-sizing: border-box') // this should be fixed

  let cssRecFill2 = TestUtil.findCSSBySelector(classes, '.AbsScreen .RecFill')[0]
  assertCSS(cssRecFill2, 'width: 100%')

});

function assertCSS (file, statementToFind) {
  expect(file.code.indexOf(statementToFind)).toBeGreaterThanOrEqual(0)
}

function assertNotCSS (file, statementToFind) {
  expect(file.code.indexOf(statementToFind)).toBe(-1)
}


