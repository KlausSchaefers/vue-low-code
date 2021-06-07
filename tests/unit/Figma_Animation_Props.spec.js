import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaSwitch from './data/figmaSwitch.json'


import * as TestUtil from './TestUtil'

test('Test Figma Animation Props', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaSwitch.id, figmaSwitch)

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
  expect(model.screens.length).toBe(2)

  let componentScreen = model.screens[1]
  expect(componentScreen.isComponentScreen).toBe(true)
  expect(componentScreen.children.length).toBe(1)
  expect(componentScreen.children[0].children.length).toBe(2)

  let screen = model.screens[0]
  console.debug(TestUtil.print(screen, e => e.props.figmaAnimation ? ' - Animation' : " -  X"))



});