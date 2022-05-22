import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaNestBugKokos from './data/figmaNestedBugKokos_ManualFix.json'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'

import * as TestUtil from './TestUtil'

test('Test Wrong Nesting', async () => {

    /**
     * first call figma service to check taht all the boolean stuff and so is ignored
     */
    let figmaService = new FigmaService()
    figmaService.setDownloadVectors(false)
    let app = await figmaService.parse(figmaNestBugKokos.id, figmaNestBugKokos)

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
    let background = TestUtil.findOneElementsByName(screen, 'Background')
    expect(background.children.length).toBe(4)


    let backgroundImage = TestUtil.findOneElementsByName(screen, 'BackgroundImage')
    backgroundImage.style.backgroundImage = {
        url: 'test.png'
      }

    let compressed = new CSSOptimizer().runTree(model)
    let classes = new CSSFactory().generate(compressed)

    let cssBackground = TestUtil.findCSSBySelector(classes, '.Background')[0]
    expect(cssBackground.code.indexOf('grid-template-columns: 391px 152px 36px minmax(0,1fr) 36px 151px 392px;')).toBeGreaterThan(0)

  
    let cssBackgroundImage = TestUtil.findCSSBySelector(classes, '.BackgroundImage')[0]
    expect(cssBackgroundImage.code.indexOf('width')).toBe(-1)
    expect(cssBackgroundImage.code.indexOf('height')).toBe(-1)
   

});