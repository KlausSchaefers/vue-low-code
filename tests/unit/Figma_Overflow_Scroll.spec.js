import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaAutoLayout from './data/figmaAutoLayout.json'


import * as TestUtil from './TestUtil'

test('Test Wrong Nesting', async () => {

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

  expect(screen.children.length).toBe(2)
  /**
   * The scroll container should be foound because of parent child relation ship
   */
  expect(screen.children[0].name).toBe('ScrollContainer')
  expect(screen.children[0].children[0].name).toBe('ItemContainer')
  /**
   * Visual contaimner because of visual relation ship
   */
  expect(screen.children[1].name).toBe('VisualContainer')
  expect(screen.children[1].children[0].name).toBe('VisualChild')
});