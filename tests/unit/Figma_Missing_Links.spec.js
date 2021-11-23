import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaMissingLink from './data/figmaMissingLink.json'

import * as Util from '../../src/qux/core/ExportUtil'
import Logger from '../../src/qux/core/Logger'
import * as TestUtil from './TestUtil'

test('Test Figma Missing links', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaMissingLink.id, figmaMissingLink)

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
  let screen = model.screens.find(s => s.name === 'Home')

  let btn = TestUtil.findOneElementsByName(screen, 'ShowMoreBtn')
  expect(btn.lines.length).toBe(1)
  expect(btn.lines[0].figmaTo).toBe('3:6')

   
 
});

