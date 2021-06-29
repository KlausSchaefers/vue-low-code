import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaAutoLayoutScreen from './data/figmaAutoLayoutScreen.json'
import figmaAutoLayoutScreenWrapped from './data/figmaAutoLayoutScreenWrapped.json'
import * as Util from '../../src/qux/core/ExportUtil'
import Logger from '../../src/qux/core/Logger'
import * as TestUtil from './TestUtil'

test('Test Figma Auto Screen', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaAutoLayoutScreen.id, figmaAutoLayoutScreen)

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
  expect(Util.isLayoutAutoHorizontal(screen)).toBe(true)

  let css = TestUtil.generateCSS(model)
  expect(TestUtil.hasCSSBySelector(css, '.qux-screen.metaHeader', 'padding-left: 64px;')).toBe(true)

});




test('Test Figma Auto Screen Wrapped', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaAutoLayoutScreenWrapped.id, figmaAutoLayoutScreenWrapped)

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
  expect(Util.isLayoutAutoHorizontal(screen)).toBe(false)
  expect(Util.isLayoutAutoHorizontal(screen.children[0])).toBe(true)

  let css = TestUtil.generateCSS(model)
  expect(TestUtil.hasCSSBySelector(css, '.metaHeader', 'padding-left: 64px;')).toBe(true)
  expect(TestUtil.hasCSSBySelector(css, '.metaHeader', 'width: 896px;')).toBe(true)
});
