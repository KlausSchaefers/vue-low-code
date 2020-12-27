import ModelTransformer from '../../src/qux/core/ModelTransformer'
import gridFixedTest from './data/gridFixedTest.json'
import * as TestUtil from './TestUtil'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'

test('Test Horizontal', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */

  let t = new ModelTransformer(gridFixedTest)
  let model = t.transform()

  expect(model).not.toBeNull()


  let compressed = new CSSOptimizer().runTree(model)
  let classes = new CSSFactory().generate(compressed)

  // no template
  let pinned = TestUtil.findCSSBySelector(classes, '.CntrLeftPinned')[0]
  assertCSS(pinned, 'grid-template-columns: 80px minmax(0,1fr) 80px minmax(0,1fr) 80px minmax(0,1fr) 16%;')

  let rel = TestUtil.findCSSBySelector(classes, '.CntrRel')[0]
  assertCSS(rel, 'grid-template-columns: 6.7% minmax(0,1fr) 6.7% minmax(0,1fr) 6.7% minmax(0,1fr) 16%;')

  let fixed = TestUtil.findCSSBySelector(classes, '.CntrFixed')[0]
  assertCSS(fixed, 'grid-template-columns: 6.7% 256px 6.7% 256px 6.7% 256px minmax(0,1fr)')


});


export function assertCSS (file, statementToFind) {
  expect(file.code.indexOf(statementToFind)).toBeGreaterThanOrEqual(0)
}


