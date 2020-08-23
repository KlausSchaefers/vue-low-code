import ModelTransformer from '../../src/qux/core/ModelTransformer'
import masterGroups from './data/masterGroups.json'
import * as Util from '../../src/qux/core/ExportUtil'
import * as TestUtil from './TestUtil'

test('Test Master Groups', () => {

  /**
   * Check that group is copied
   */
  let inModel = Util.createInheritedModel(masterGroups)
  expect(Object.values(inModel.groups).length).toBe(2)

  let t = new ModelTransformer(masterGroups, {
    css: {
      grid: true
    }
  })
  let model = t.transform()

  expect(model).not.toBeNull()

  let master = model.screens[1]
  console.debug(TestUtil.print(master))
  /**
   * Expect the group to be copied which should have resulted in main child
   */
  expect(master.children.length).toBe(1)
  expect(master.children[0].children.length).toBe(2)

  let screen = model.screens[0]
  //console.debug(TestUtil.print(screen))
  expect(screen.children.length).toBe(1)
  expect(screen.children[0].children.length).toBe(2)

});