import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import fixedRemovedFromLayout from './data/fixedRemovedFromLayout.json'

import * as TestUtil from './TestUtil'


test('Test Fixed', async () => {

 /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(fixedRemovedFromLayout.id, fixedRemovedFromLayout)


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

  expect(screen.children.length).toBe(3)

  let lowerBox = TestUtil.findOneElementsByName(screen, 'LowerBox')
  expect(lowerBox).not.toBeNull()
  console.debug(lowerBox)
  expect(lowerBox.children.length).toBe(2)
  expect(lowerBox.top).toBe(221)
});

