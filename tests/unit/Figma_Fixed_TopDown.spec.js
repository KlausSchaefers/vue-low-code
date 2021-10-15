import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaAutoLayoutHug from './data/figmaAutoLayoutHug.json'


import * as Util from '../../src/qux/core/ExportUtil'
import Logger from '../../src/qux/core/Logger'
import * as TestUtil from './TestUtil'
import figmaFixedTopDown from './data/figmaFixedTopDown.json'

test('Test Figma Fixed Top Down', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaFixedTopDown.id, figmaFixedTopDown)

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
  let screen = model.screens.find(s => s.name === 'MobileMenu')
  console.debug(TestUtil.print(screen))

   
  let cntr = TestUtil.findOneElementsByName(screen, 'Container')
  expect(Util.isPinnedUp(cntr)).toBe(true)
  expect(Util.isPinnedUp(cntr)).toBe(true)
  expect(cntr.top).toBe(0)
  expect(cntr.bottom).toBe(0)
  console.debug(cntr.bottom)




});






