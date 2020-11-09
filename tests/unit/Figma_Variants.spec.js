import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaVariants from './data/figmaVariants.json'


import * as TestUtil from './TestUtil'

test('Test Varients', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaVariants.id, figmaVariants)

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

  expect(screen.children.length).toBe(1)
  /**
   * The scroll container should be foound because of parent child relation ship
   */
  expect(screen.children[0].name).toBe('VarientButton')
  expect(screen.children[0].props.isComponet).toBe(undefined)
  expect(screen.children[0].children.length).toBe(2)
  expect(screen.children[0].children[0].name).toBe('VarientButton-Primary')
  expect(screen.children[0].children[1].name).toBe('VarientButton-Secondary')


});


test('Test parseVarinet', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()

  let parsed = figmaService.parseVariant('mouse=Default, size=Default')
  expect(parsed.mouse).toBe('Default')
  expect(parsed.size).toBe('Default')

});