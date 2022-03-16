
import ModelTransformer from '../../src/qux/core/ModelTransformer'
import * as TestUtil from './TestUtil'
import responsiveWidthPaddingBug from './data/responsiveWidthPaddingBug.json'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'

test('Responsive Padding Bug', () => {


  let t = new ModelTransformer(responsiveWidthPaddingBug)
  let model = t.transform()

  expect(model.screens.length).toBe(1)

  let screen = model.screens.find(s => s.name === 'Search')
  expect(screen).not.toBeNull()

  let compressed = new CSSOptimizer().runTree(model)
  let classes = new CSSFactory().generate(compressed)

  let textBoxCSS = TestUtil.findCSSBySelector(classes, '.Search .TextBox')[0]
  expect(textBoxCSS.code.indexOf("width: 87%")).toBe(-1) 
  expect(textBoxCSS.code.indexOf("width: calc(87% - 26px);")).toBeGreaterThan(0) 


});
