import JSONPath from '../../src/qux/core/JSONPath'

const viewModel = {
  searchFilter: "",
  todos: [
      {
        id:1,
        name: "111",
        details: "11111111",
      },
      {
        id:2,
        name: "2222",
        details: "222222",
      }
  ],
  newTodo: {
    name: "",
    details: "",
  },
  selectedTodo: {
    name: "",
    details: "",
  },
}

test('Test JSON Path', () => {


  expect(JSONPath.has(viewModel, 'searchFilter')).toBe(true)
  expect(JSONPath.has(viewModel, 'todos')).toBe(true)
});