import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaAutoLayoutHug from './data/figmaAutoLayoutHug.json'


import * as Util from '../../src/qux/core/ExportUtil'
import Logger from '../../src/qux/core/Logger'
import * as TestUtil from './TestUtil'

test('Test Figma Auto Fixed Cenrer', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaAutoLayoutHug.id, figmaAutoLayoutHug)

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
  let screen = model.screens.find(s => s.name === 'Home')
  console.debug(TestUtil.print(screen))
   
  let fix = TestUtil.findOneElementsByName(screen, 'FixedButton')
  expect(fix.w).toBe(130)
  expect(Util.isFixedHorizontal(fix)).toBe(true) 
  expect(Util.isHugHorizontal(fix)).toBe(false) 
  

  let hug = TestUtil.findOneElementsByName(screen, 'HugButton')
  console.debug('XXXX', hug.props)
  expect(hug.w).toBe(141)
  expect(Util.isFixedHorizontal(hug)).toBe(true) 
  expect(Util.isHugHorizontal(hug)).toBe(true) 




});






