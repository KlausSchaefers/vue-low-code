import ModelTransformer from '../../src/qux/core/ModelTransformer'
import layoutRowAndGrid from './data/layoutRowAndGrid.json'
import {Layout} from '../../src/qux/core/Const'
import * as TestUtil from './TestUtil'


test('Test Correct layout property', () => {

  let t = new ModelTransformer(layoutRowAndGrid)
  let model = t.transform()

  expect(model.screens.length).toBe(1)

  let screen = model.screens.find(s => s.id === 's10000')
  expect(screen).not.toBe(null)
  expect(screen.layout.type).toBe(Layout.Row)

  console.debug(TestUtil.print(screen))

  assertLayout(screen, 'RowGrid', Layout.Grid )
  assertLayout(screen, 'RowRow', Layout.Row )
  assertLayout(screen, 'RowWrap', Layout.Wrap )
});

function assertLayout(screen, name, type) {
  let e = TestUtil.findOneElementsByName(screen, name)
  expect(e).not.toBeUndefined()
  expect(e.layout.type).toBe(type)
}

