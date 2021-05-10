import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaDesignSystemUpdateBug from './data/figmaDesignSystemUpdateBug.json'

import * as TestUtil from './TestUtil'

test('Figma Text Styles', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaDesignSystemUpdateBug.id, figmaDesignSystemUpdateBug)


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


  let variantRed = TestUtil.findOneElementsByName(screen, 'VarientButton-Primary-Out')
  expect(variantRed).not.toBeUndefined()
  expect(variantRed.variant).not.toBeUndefined()
  expect(variantRed.variant.type).toBe('Primary')
  expect(variantRed.variant.state).toBe('Out')
  console.debug(variantRed.variant)
});