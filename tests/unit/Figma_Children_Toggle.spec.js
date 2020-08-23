import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaChildrenToggle from './data/figmaChildrenToggle.json'


import * as TestUtil from './TestUtil'

test('Test Wrong Nesting', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaChildrenToggle.id, figmaChildrenToggle)

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

  let checkBoxBorder = TestUtil.findElementsByName(screen, 'CheckBoxBorder')[0]
  expect(checkBoxBorder).not.toBeNull()
  expect(checkBoxBorder.children.length).toBe(1)
  expect(checkBoxBorder.qtype).toBe('qChildrenToggle')

});