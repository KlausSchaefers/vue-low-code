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
  //expect(btn.style.borderBottomWidth).toBe(2)
  //expect(btn.style.borderTopWidth).toBe(5)
  //expect(btn.style.borderLeftWidth).toBe(4)
  //expect(btn.style.borderRightWidth).toBe(3)
    
});


test('Test FigmaUtil parseStrokeGeometry() > default', async () => { 
  const size = {
    "x": 100.0,
    "y": 64.0
  }
  const path = "M0 0L0 -6L-6 -6L-6 0L0 0ZM100 0L106 0L106 -6L100 -6L100 0ZM100 64L100 70L106 70L106 64L100 64ZM0 64L-6 64L-6 70L0 70L0 64ZM0 6L100 6L100 -6L0 -6L0 6ZM94 0L94 64L106 64L106 0L94 0ZM100 58L0 58L0 70L100 70L100 58ZM6 64L6 0L-6 0L-6 64L6 64Z"                        
  const border = FigmaUtil.parseStrokeGeometry(path)
  console.debug(border)

  //expect(border.borderBottomWidth).toBe(6)
  //expect(border.borderTopWidth).toBe(6)
  //expect(border.borderLeftWidth).toBe(6)
  //expect(border.borderRightWidth).toBe(6)
})

test('Test FigmaUtil parseStrokeGeometry() > mixed', async () => { 
  const size = {
    "x": 88.0,
    "y": 91.0
  }
  const path =  "M-4 -5L91 -5L85 5L4 5L-4 -5ZM91 93L-4 93L4 89L85 89L91 93ZM-4 93L-4 -5L4 5L4 89L-4 93ZM91 -5L91 93L85 89L85 5L91 -5Z"
  const border = FigmaUtil.parseStrokeGeometry(path)
  console.debug(border)

  //expect(border.borderBottomWidth).toBe(2)
  //expect(border.borderTopWidth).toBe(5)
  //expect(border.borderLeftWidth).toBe(4)
  //expect(border.borderRightWidth).toBe(3)
})