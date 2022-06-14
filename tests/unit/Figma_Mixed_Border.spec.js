import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import * as FigmaUtil from '../../src/qux/figma/FigmaUtil'
import figmaMixedBorders from './data/figmaMixedBorders.json'

import * as Util from '../../src/qux/core/ExportUtil'
import Logger from '../../src/qux/core/Logger'
import * as TestUtil from './TestUtil'

test('Test Figma Mixed Borders', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaMixedBorders.id, figmaMixedBorders)

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
  let screen = model.screens.find(s => s.name === 'Frame1')
  expect(screen).not.toBeUndefined()

  let btn = TestUtil.findOneElementsByName(screen, 'Mixed')
  expect(btn.style.borderBottomWidth).toBe(2)
  expect(btn.style.borderTopWidth).toBe(5)
  expect(btn.style.borderLeftWidth).toBe(4)
  expect(btn.style.borderRightWidth).toBe(3)

  let top = TestUtil.findOneElementsByName(screen, 'Top')
  expect(top.style.borderBottomWidth).toBe(0)
  expect(top.style.borderTopWidth).toBe(1)
  expect(top.style.borderLeftWidth).toBe(0)
  expect(top.style.borderRightWidth).toBe(0)

  
    
});

