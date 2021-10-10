import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaNestedVecors from './data/figmaNestedVecors.json'

import * as Util from '../../src/qux/core/ExportUtil'
import Logger from '../../src/qux/core/Logger'
import * as TestUtil from './TestUtil'

test('Test Figma Nested Vector', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaNestedVecors.id, figmaNestedVecors, true, ['Mobile'])

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
  console.debug(TestUtil.print(screen))
   
  let hero = TestUtil.findOneElementsByName(screen, 'Hero')
  expect(hero.children.length).toBe(2)


  let logo = TestUtil.findOneElementsByName(screen, 'luisa-cloud-logo')
  expect(logo.children.length).toBe(0)
  expect(logo.type).toBe('Vector')
});

