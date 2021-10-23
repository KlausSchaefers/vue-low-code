import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaAutoLayoutFixedCentered from './data/figmaAutoLayoutFixedCentered.json'
import figmaAutoLayoutFixedCentered2 from './data/figmaAutoLayoutFixedCentered2.json'
import figmaAutoLayoutGrow from './data/figmaAutoLayoutGrow'

import * as Util from '../../src/qux/core/ExportUtil'
import Logger from '../../src/qux/core/Logger'
import * as TestUtil from './TestUtil'

test('Test Figma Auto Fixed Cenrer', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaAutoLayoutFixedCentered.id, figmaAutoLayoutFixedCentered)

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
   

  let body = TestUtil.findOneElementsByName(screen, 'Body')
  expect(body.w).toBe(1440)
  //expect(Util.isFixedHorizontal(body)).toBe(false)

  /**
  let content = TestUtil.findOneElementsByName(screen, 'Content')
  expect(content.w).toBe(1200)
  expect(Util.isFixedHorizontal(content)).toBe(true)
   
  let header = TestUtil.findOneElementsByName(screen, 'Header')
  expect(header.w).toBe(1440)
  expect(Util.isFixedHorizontal(header)).toBe(false)

  let navBar = TestUtil.findOneElementsByName(screen, 'NavBar')
  expect(navBar.w).toBe(1200)
  expect(Util.isFixedHorizontal(navBar)).toBe(true)

  */


  

  //let css = TestUtil.generateCSS(model)
  //expect(TestUtil.hasCSSBySelector(css, '.qux-screen.metaHeader', 'padding-left: 64px;')).toBe(true)

});


test('Test Figma Auto Fixed Cenrer 2', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaAutoLayoutFixedCentered2.id, figmaAutoLayoutFixedCentered2)

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
  //console.debug(TestUtil.print(screen))
  

  let content = TestUtil.findOneElementsByName(screen, 'Content')
  expect(content.w).toBe(1200)
  //expect(Util.isFixedHorizontal(content)).toBe(true)



  

  //let css = TestUtil.generateCSS(model)
  //expect(TestUtil.hasCSSBySelector(css, '.qux-screen.metaHeader', 'padding-left: 64px;')).toBe(true)

});



test('Test Figma Auto Fixed Cenrer 3', async () => {
  Logger.logLevel = 1

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaAutoLayoutGrow.id, figmaAutoLayoutGrow)

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


  let navLeft = TestUtil.findOneElementsByName(screen, 'NavbarLeft')
  expect(Util.isFixedHorizontal(navLeft)).toBe(false)



});


