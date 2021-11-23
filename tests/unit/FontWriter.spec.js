
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaFontTest from './data/figmaFontTest.json'
import FontWriter from '../../src/qux/core/FontWriter'

import * as TestUtil from './TestUtil'

test('Test Custom Fonts Figma', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaFontTest.id, figmaFontTest)


  let fonts = FontWriter.getCustomFonts(app)
  console.debug(fonts)
  expect(Object.values(fonts).length).toBe(3)
  //expect(fonts['Roboto'].length).toBe(2)

});