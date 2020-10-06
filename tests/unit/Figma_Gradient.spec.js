import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaChildrenToggle from './data/figmaGradient.json'


import * as TestUtil from './TestUtil'

test('Test Gradients', async () => {

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

  // console.debug(TestUtil.print(screen))

  let topDown = TestUtil.findElementsByName(screen, 'TopDown')[0]

  expect(topDown).not.toBeNull()
  expect(topDown.qtype).not.toBe('qVector')
  expect(topDown.style.background.direction).toBe(180)

  let downTop = TestUtil.findElementsByName(screen, 'DownUp')[0]
  expect(downTop).not.toBeNull()
  expect(downTop.qtype).not.toBe('qVector')
  expect(downTop.style.background.direction).toBe(0)


  let radial = TestUtil.findElementsByName(screen, 'Radial')[0]
  expect(radial).not.toBeNull()
  expect(radial.qtype).not.toBe('qVector')
  expect(radial.style.background.radial).toBe(true)

});