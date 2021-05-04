import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaTextStyle from './data/figmaTextStyle.json'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'

import * as TestUtil from './TestUtil'

test('Figma Text Styles', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaTextStyle.id, figmaTextStyle)

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
  expect(screen.pageName).toBe('Page 1')

  let normal = TestUtil.findOneElementsByName(screen, 'Normal')
  expect(normal).not.toBeUndefined()
  expect(normal.style.textTransform).toBeUndefined()

  let upper = TestUtil.findOneElementsByName(screen, 'Upper')
  expect(upper).not.toBeUndefined()
  expect(upper.style.textTransform).toBe('uppercase')

  let lower = TestUtil.findOneElementsByName(screen, 'Lower')
  expect(lower).not.toBeUndefined()
  expect(lower.style.textTransform).toBe('lowercase')

  let caps = TestUtil.findOneElementsByName(screen, 'Caps')
  expect(caps).not.toBeUndefined()
  expect(caps.style.textTransform).toBe('capitalize')


 let compressed = new CSSOptimizer().runTree(model)
 let classes = new CSSFactory().generate(compressed)

 let cssNormal = TestUtil.findCSSBySelector(classes, '.Normal')[0]
 expect(cssNormal.code.indexOf('text-transform:;')).toBe(-1)

 let cssUpper = TestUtil.findCSSBySelector(classes, '.Upper')[0]
 expect(cssUpper.code.indexOf('text-transform: uppercase;')).toBeGreaterThan(0)

 let cssLower = TestUtil.findCSSBySelector(classes, '.Lower')[0]
 expect(cssLower.code.indexOf('text-transform: lowercase;')).toBeGreaterThan(0)

 let cssCaps = TestUtil.findCSSBySelector(classes, '.Caps')[0]
 expect(cssCaps.code.indexOf('text-transform: capitalize;')).toBeGreaterThan(0)

});