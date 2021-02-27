import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaMasterComponentBug from './data/figmaMasterComponentBug.json'


import * as TestUtil from './TestUtil'

test('Test Image Fills', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaMasterComponentBug.id, figmaMasterComponentBug)

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
  expect(screen).not.toBeUndefined()

  // here should be only two children, but the scrolls are created as vectors,
  // that's why the things are not embedded

  //console.debug(TestUtil.print(screen))

  // FIXME: now test that the elements are correctly embedded.
  // expect(screen.children.length).toBe(2)


});