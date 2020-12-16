import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaAutoLayout from './data/figmaAutoFixed.json'
import * as Util from '../../src/qux/core/ExportUtil'

import * as TestUtil from './TestUtil'

test('Test Figma Auto Fixed', async () => {

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

  console.debug(TestUtil.print(screen))

  let fixed1 = TestUtil.findElementsByName(screen, 'Fixed1')[0]
  expect(fixed1).not.toBeNull()
  expect(Util.isFixedHorizontal(fixed1)).toBe(true)

  let fixed2 = TestUtil.findElementsByName(screen, 'Fixed2')[0]
  expect(fixed2).not.toBeNull()
  expect(Util.isFixedHorizontal(fixed2)).toBe(true)

  let grow = TestUtil.findElementsByName(screen, 'Grow')[0]
  expect(grow).not.toBeNull()
  expect(Util.isFixedHorizontal(grow)).toBe(false)
});


