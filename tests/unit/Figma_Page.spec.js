import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaAutoLayout from './data/figmaAutoLayout.json'


import * as TestUtil from './TestUtil'

test('Test Page name added', async () => {

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
  console.debug(screen)
  expect(screen.pageName).toBe('Page 1')


});