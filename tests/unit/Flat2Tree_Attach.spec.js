import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'

import * as TestUtil from './TestUtil'
import * as Util from '../../src/qux/core/ExportUtil'

import luisaAttachLabelBug from './data/luisaAttachLabelBug.json'

test('Test Auto layout with single label', async () => {


  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(luisaAttachLabelBug.id, luisaAttachLabelBug)

  /**
   * Check if transform works correctly
   */
  let t = new ModelTransformer(app, {
    css: {
      attachLabels: true
    }
  })
  let model = t.transform()

  expect(model).not.toBeNull()

  let screen = model.screens[0]

  let btn = TestUtil.findOneElementsByName(screen, 'cta-button_17')
  expect(Util.isLayoutRow(btn)).toBeTruthy()


});