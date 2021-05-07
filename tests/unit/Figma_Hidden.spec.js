import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaHiddenBug from './data/figmaHiddenBug.json'

import * as TestUtil from './TestUtil'

test('Figma Hidden', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaHiddenBug.id, figmaHiddenBug)

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
  expect(screen.pageName).toBe('Page 1')
  console.debug(TestUtil.print(screen))

  let hiddenInstance = TestUtil.findOneElementsByName(screen, 'Rectangle1Instance')
  expect(hiddenInstance).toBeUndefined()


});