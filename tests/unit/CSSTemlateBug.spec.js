
import ModelTransformer from '../../src/qux/core/ModelTransformer'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'
import * as TestUtil from './TestUtil'
import app from './data/cssTemplatePaddingBug.json'

test('Test Nest Groups', () => {


  let t = new ModelTransformer(app)
  let tree = t.transform()

  let compressed = new CSSOptimizer().runTree(tree)
  let classes = new CSSFactory().generate(compressed)

  // no template
  let okBox = TestUtil.findCSSBySelector(classes, '.OKBox')[0]
  expect(okBox).not.toBeNull()
  expect(okBox.code.indexOf('min-height: 32px;')).toBeGreaterThan(0)

  // template
  let buggyBox1 = TestUtil.findCSSBySelector(classes, '.BuggyBox1')[0]
  expect(buggyBox1).not.toBeNull()
  expect(buggyBox1.code.indexOf('min-height: 32px;')).toBeGreaterThan(0)

  // template and pading overwrite
  let buggyBox2 = TestUtil.findCSSBySelector(classes, '.BuggyBox2')[0]
  expect(buggyBox2).not.toBeNull()
  expect(buggyBox2.code.indexOf('min-height: 24px;')).toBeGreaterThan(0)


  // template with fixed height
  let templateBoxFixed1 = TestUtil.findCSSBySelector(classes, '.TemplateBoxFixed1')[0]
  expect(templateBoxFixed1).not.toBeNull()
  expect(templateBoxFixed1.code.indexOf('height: 32px;')).toBeGreaterThan(0)

  // template width fixed heigth and padding overwrite
  let templateBoxFixed2 = TestUtil.findCSSBySelector(classes, '.TemplateBoxFixed2')[0]
  expect(templateBoxFixed2).not.toBeNull()
  expect(templateBoxFixed2.code.indexOf('height: 16px;')).toBeGreaterThan(0) // 64 - (2 * 24)

  // template with fixed height
  let fixedBox = TestUtil.findCSSBySelector(classes, '.FixedBox')[0]
  expect(fixedBox).not.toBeNull()
  expect(fixedBox.code.indexOf('height: 32px;')).toBeGreaterThan(0)



  // make sure the templates do no have height or so
  let redTemplateBox = TestUtil.findCSSBySelector(classes, 'RedTemplateBox')[0]
  expect(redTemplateBox).not.toBeNull()
  expect(redTemplateBox.code.indexOf('min-height')).toBe(-1)

  let whiteTemplate = TestUtil.findCSSBySelector(classes, 'WhiteBoxTemplate')[0]
  expect(whiteTemplate).not.toBeNull()
  expect(whiteTemplate.code.indexOf('min-height')).toBe(-1)
  console.debug(classes)

});
