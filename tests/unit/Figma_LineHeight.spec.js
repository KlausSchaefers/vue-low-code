import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaLineHeight from './data/figmaLineHeight.json'


import * as TestUtil from './TestUtil'

test('TestLine Height 150', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService(null, {css: {autoLineHeightAsNormal: false}})
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


test('Test LineHeight normal', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
   let figmaService = new FigmaService(null, {css: {autoLineHeightAsNormal: true}})
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

  //console.debug(TestUtil.print(screen))

  let login20 = TestUtil.findOneElementsByName(screen, 'Login20')
  expect(login20.style.fontSize).toBe(12)
  expect(login20.style.lineHeightPX).toBe(20)

  let login50 = TestUtil.findOneElementsByName(screen, 'Login50')
  expect(login50.style.fontSize).toBe(12)
  expect(login50.style.lineHeightPX).toBe(50)


  let loginAuto = TestUtil.findOneElementsByName(screen, 'LoginAuto')
  expect(loginAuto.style.fontSize).toBe(12)
  expect(loginAuto.style.lineHeight).toBe('normal')


  let loginAutoLarge = TestUtil.findOneElementsByName(screen, 'LoginAutoLarge')
  expect(loginAutoLarge.style.fontSize).toBe(12)
  expect(loginAutoLarge.style.lineHeight).toBe('normal')


  let loginAuto24 = TestUtil.findOneElementsByName(screen, 'LoginAuto24')
  expect(loginAuto24.style.fontSize).toBe(24)
  expect(loginAuto24.style.lineHeight).toBe('normal')


  let loginAuto150p = TestUtil.findOneElementsByName(screen, 'LoginAuto150p')
  expect(loginAuto150p.style.fontSize).toBe(24)
  expect(loginAuto150p.style.lineHeight).toBe(1.5)

  /**
   * Needs to be fixed later
   */
  let label1214 = TestUtil.findOneElementsByName(screen, 'Label1214')
  //console.debug(label1214.style)
  expect(label1214.style.fontSize).toBe(12)
  expect(label1214.style.lineHeight).toBe('normal')
});