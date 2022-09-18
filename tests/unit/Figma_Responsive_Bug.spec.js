import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaResponsiveBug from './data/figmaResponsiveBug.json'

import Logger from '../../src/qux/core/Logger'
import * as TestUtil from './TestUtil'

import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'


test('Test Figma Responsive Bug', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaResponsiveBug.id, figmaResponsiveBug)

  const config = {
    css: {
      grid: true
    },
    responsive: [
        { page: "Desktop", types: ["desktop"] },
        { page: "Mobile", types: ["tablet", "mobile"] },
    ]
  }

  /**
   * Check if transform works correctly
   */
  let t = new ModelTransformer(app, config)
  let model = t.transform()

  expect(model).not.toBeNull()

  let compressed = new CSSOptimizer().runTree(model)
  let classes = new CSSFactory(config).generate(compressed)

  expect(classes).not.toBeNull()

 
});

