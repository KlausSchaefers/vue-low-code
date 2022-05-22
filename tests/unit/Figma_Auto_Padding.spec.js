import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaAutoMixedPadding from './data/figmaAutoMixedPadding.json'
import * as TestUtil from './TestUtil'
import * as Util from '../../src/qux/core/ExportUtil'

import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'


test('Test Auto Padding', async () => {

    let figmaService = new FigmaService()
    figmaService.setDownloadVectors(false)
    let app = await figmaService.parse(figmaAutoMixedPadding.id, figmaAutoMixedPadding)

    let t = new ModelTransformer(app)
    let model = t.transform()
    expect(model).not.toBeNull()

    let screen = model.screens.find(s => s.name === 'Screen')
    let auto = TestUtil.findOneElementsByName(screen, 'Auto')
    expect(auto.layout.paddingTop).toBe(16)
    expect(auto.layout.paddingBottom).toBe(30)
  

    let left = TestUtil.findOneElementsByName(screen, 'Left')
    expect(left.w).toBe(100)
    expect(Util.isFixedHorizontal(left)).toBe(true)
    expect(Util.isHugHorizontal(left)).toBe(false)
  
    let compressed = new CSSOptimizer().runTree(model)
    let classes = new CSSFactory().generate(compressed)

    // test css a little
    let cssLeft = TestUtil.findCSSBySelector(classes, '.Screen .Left')[0]
    console.debug(cssLeft.code)
    assertCSS(cssLeft, 'width: 100px')
   
});

function assertCSS (file, statementToFind) {
  expect(file.code.indexOf(statementToFind)).toBeGreaterThanOrEqual(0)
}

function assertNotCSS (file, statementToFind) {
  expect(file.code.indexOf(statementToFind)).toBe(-1)
}


