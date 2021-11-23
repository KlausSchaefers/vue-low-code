import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaAutoFixedChildren from './data/figmaAutoFixedChildren.json'


import * as Util from '../../src/qux/core/ExportUtil'
import Logger from '../../src/qux/core/Logger'
import * as TestUtil from './TestUtil'

test('Test Figma Auto Fixed Childen', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaAutoFixedChildren.id, figmaAutoFixedChildren)

  /**
   * Check if transform works correctly
   */
  let t = new ModelTransformer(app, {
  })
  let model = t.transform()

  expect(model).not.toBeNull()
  let screen = model.screens.find(s => s.name === 'why')

  let fixed = TestUtil.findOneElementsByName(screen, 'Fixed')
  expect(Util.isFixedHorizontal(fixed)).toBe(false)
  
  let css = TestUtil.generateCSS(model)

  expect(TestUtil.hasCSSBySelector(css, '.Fill', 'width: 100%;')).toBe(true)
  expect(TestUtil.hasCSSBySelector(css, '.Fixed', 'width: 100%;')).toBe(true)

});

test('Test Figma Auto Fixed Childen 2', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService('', {figma:{fixed2Fill: false}})
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaAutoFixedChildren.id, figmaAutoFixedChildren)

  /**
   * Check if transform works correctly
   */
  let t = new ModelTransformer(app, {
  })
  let model = t.transform()

  expect(model).not.toBeNull()   
  
  let css = TestUtil.generateCSS(model)
  expect(TestUtil.hasCSSBySelector(css, '.Fill', 'width: 100%;')).toBe(true)
  expect(TestUtil.hasCSSBySelector(css, '.Fixed', 'width: 100%;')).toBe(false)
  expect(TestUtil.hasCSSBySelector(css, '.Fixed', 'width: 366px;')).toBe(true)
});
