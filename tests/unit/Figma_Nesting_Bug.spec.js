import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaNestingBug from './data/figmaNestingBug.json'
import figmaNestingBug2 from './data/figmaNestingBug2.json'

import * as TestUtil from './TestUtil'

test('Test Wrong Nesting', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaNestingBug.id, figmaNestingBug)

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

  TestUtil.print(screen)

  expect(screen.children.length).toBe(3)


});

test('Test Wrong Nesting 2', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaNestingBug2.id, figmaNestingBug2)


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
  expect(screen.children.length).toBe(2)

  /**
   * Test the the fixed stuff is also correctly set
   */
  expect(screen.fixedChildren.length).toBe(1)
  expect(screen.fixedChildren[0].children.length).toBe(1)
});


