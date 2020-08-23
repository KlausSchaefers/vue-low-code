
import ModelTransformer from '../../src/qux/core/ModelTransformer'
import * as Util from '../../src/qux/core/ExportUtil'

import groups from './data/groups.json'


test('Test Nest Groups', () => {
  delete groups.screens.s10000
  delete groups.screens.s10015

  let t = new ModelTransformer(groups)
  let model = t.transform()

  expect(model.screens.length).toBe(1)

  let screen = model.screens.find(s => s.name === 'NormalNestGroups')
  expect(screen).not.toBeNull()

  console.debug(Util.print(screen))


  expect(screen.children.length).toBe(1)
  expect(screen.children[0].name).toBe('OuterGroup')
  expect(screen.children[0].children.length).toBe(2)
  expect(screen.children[0].children[0].name).toBe('Button')
  expect(screen.children[0].children[1].name).toBe('InnerGroup')

});
