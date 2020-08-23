import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaNestingBug2 from './data/figmaNestingBug2.json'
import * as TestUtil from './TestUtil'

test('Test TextBox', async () => {

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
  expect(screen.fixedChildren.length).toBe(1)

  let searchCntr = TestUtil.findElementsByName(screen, 'SearchCntr')[0]
  expect(searchCntr).not.toBeNull()
  expect(searchCntr.children.length).toBe(2)

  let searchBox = TestUtil.findElementsByName(screen, 'SearchBox')[0]
  expect(searchBox).not.toBeNull()

  expect(searchBox.props.label).toBe('Brocoli')
  expect(searchBox.type).toBe('TextBox')
  expect(searchBox.qtype).toBe('qTextBox')

});
