import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaLineHeight from './data/figmaLineHeight.json'


import * as TestUtil from './TestUtil'

test('Test Wrong Nesting', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaLineHeight.id, figmaLineHeight)

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

  let login20 = TestUtil.findOneElementsByName(screen, 'Login20')
  expect(login20.style.fontSize).toBe(12)
  expect(login20.style.lineHeightPX).toBe(20)

  let login50 = TestUtil.findOneElementsByName(screen, 'Login50')
  expect(login50.style.fontSize).toBe(12)
  expect(login50.style.lineHeightPX).toBe(50)


  let loginAuto = TestUtil.findOneElementsByName(screen, 'LoginAuto')
  expect(loginAuto.style.fontSize).toBe(12)
  expect(loginAuto.style.lineHeightPX).toBe(18)


  let loginAutoLarge = TestUtil.findOneElementsByName(screen, 'LoginAutoLarge')
  expect(loginAutoLarge.style.fontSize).toBe(12)
  expect(loginAutoLarge.style.lineHeightPX).toBe(18)


  let loginAuto24 = TestUtil.findOneElementsByName(screen, 'LoginAuto24')
  expect(loginAuto24.style.fontSize).toBe(24)
  expect(loginAuto24.style.lineHeightPX).toBe(36)


  let loginAuto150p = TestUtil.findOneElementsByName(screen, 'LoginAuto150p')
  expect(loginAuto150p.style.fontSize).toBe(24)
  expect(loginAuto150p.style.lineHeight).toBe(1.5)

});