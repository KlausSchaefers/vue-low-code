import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaBlog from './data/figmaBlog.json'
import * as Util from '../../src/qux/core/ExportUtil'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'
import * as TestUtil from './TestUtil'

test('Test Bounding Box error', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaBlog.id, figmaBlog)

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

  //let screen = model.screens[0]
  //console.debug(TestUtil.print(screen))


  //let compressed = new CSSOptimizer().runTree(model)
  //let classes = new CSSFactory().generate(compressed)
  //expect(classes).not.toBeNull(classes)
  // expect(classes).not.toBeUndefined(classes)

});



