import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaMeta from './data/figmaMeta.json'


import * as Util from '../../src/qux/core/ExportUtil'
import Logger from '../../src/qux/core/Logger'
import * as TestUtil from './TestUtil'

test('Test Figma Auto Fixed Childen', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaMeta.id, figmaMeta)

  /**
   * Check if transform works correctly
   */
  let t = new ModelTransformer(app, {})
  let model = t.transform()

  expect(model).not.toBeNull()
  let screen = model.screens.find(s => s.name === 'why')
  expect(screen.meta.keywords).toBe('key1, key2, key3')
  expect(screen.meta.description).toBe('This is a cool page')
  

});