import figmaTodoexample from './data/figmaTodoexample.json'

import ModelTransformer from '../../src/qux/core/ModelTransformer'
import * as TestUtil from './TestUtil'

test('Test Default DataBinding', async () => {


  let t = new ModelTransformer(figmaTodoexample, {
    css: {
      grid: true,
      attachLabels: true
    },
    addDefaultDatabinding: true
  })
  let model = t.transform()

  expect(model).not.toBeNull()

  let newToDo = model.screens.find(s => s.name === 'NewTodo')
  console.debug(TestUtil.print(newToDo))

  let detailTextArea = TestUtil.findOneElementsByName(newToDo, 'DetailTextArea')
  expect(detailTextArea.props.databinding.default).toBe('newTodo.details')

  let searchBox = TestUtil.findOneElementsByName(newToDo, 'SearchBox')
  expect(searchBox.props.databinding.default).toBe('newTodo.name')


});