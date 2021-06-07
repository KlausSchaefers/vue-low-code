import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaDropDown from './data/figmaDropDown.json'


import * as TestUtil from './TestUtil'

test('Test DropDown', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaDropDown.id, figmaDropDown)

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

  let dropDown = TestUtil.findOneElementsByName(screen, 'DropDown')

  expect(dropDown.type).toBe('DropDown')
  expect(dropDown.props.options[0]).toBe('aaaa')
  expect(dropDown.props.options[3]).toBe('dddd')
  expect(dropDown.props.label).toBe('Klaus Drop Down')

  let frameDropDown = TestUtil.findOneElementsByName(screen, 'FrameDropDown')
  expect(frameDropDown.type).toBe('DropDown')
  expect(frameDropDown.props.options[0]).toBe('f1')
  expect(frameDropDown.props.options[3]).toBe('f4')
  expect(frameDropDown.props.label).toBe('FrameDropDown')


  let dataDropDown = TestUtil.findOneElementsByName(screen, 'DataDropDown')
  expect(dataDropDown.type).toBe('DropDown')
  expect(dataDropDown.props.databinding.default).toBe('selected')
  expect(dataDropDown.props.databinding.options).toBe('options')


});