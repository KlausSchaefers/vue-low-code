
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'

test('Test removeVAlign() > top', () => {

    let o = new CSSOptimizer()

    let result = o.removeVAlign({
        "color": "#121212",
        "paddingTop" : 0,
        "paddingRight" : 0,
        "paddingBottom" : 0,
        "paddingLeft" : 0,
        "fontSize": 20,
        "verticalAlign": "top"
    }, {
      "w": 100,
      "h": 100
    })

    expect(result.paddingTop).toBe(0)
    expect(result.verticalAlign).toBeDefined()

});


test('Test removeVAlign() > middle', () => {

  let o = new CSSOptimizer()

  let result = o.removeVAlign({
      "color": "#121212",
      "paddingTop" : 0,
      "paddingRight" : 0,
      "paddingBottom" : 0,
      "paddingLeft" : 0,
      "fontSize": 20,
      "verticalAlign": "middle"
  }, {
    "w": 100,
    "h": 100
  })

  expect(result.paddingTop).toBe(40)
  expect(result.paddingBottom).toBe(40)
  expect(result.verticalAlign).not.toBeDefined()

});



test('Test removeVAlign() > bottom', () => {

  let o = new CSSOptimizer()

  let result = o.removeVAlign({
      "color": "#121212",
      "paddingTop" : 0,
      "paddingRight" : 0,
      "paddingBottom" : 0,
      "paddingLeft" : 0,
      "fontSize": 20,
      "verticalAlign": "bottom"
  }, {
    "w": 100,
    "h": 100
  })

  expect(result.paddingTop).toBe(80)
  expect(result.paddingBottom).toBe(0)
  expect(result.verticalAlign).not.toBeDefined()

});

test('Test compress() > true', () => {

  let o = new CSSOptimizer()

  let result = o.compress({
      "color": "#121212",
      "paddingTop" : 0,
      "paddingRight" : 0,
      "paddingBottom" : 0,
      "paddingLeft" : 0,
      "fontSize": 20,
      "verticalAlign": "bottom"
  }, {
    "w": 100,
    "h": 100
  }, true)

  expect(result._paddingTop).toBe(80)
  expect(result._paddingBottom).toBe(0)
  expect(result.padding).toBe('80px 0px 0px 0px')
  expect(result.verticalAlign).not.toBeDefined()

});

test('Test compress() > false', () => {

  let o = new CSSOptimizer()

  let result = o.compress({
      "color": "#121212",
      "paddingTop" : 0,
      "paddingRight" : 0,
      "paddingBottom" : 0,
      "paddingLeft" : 0,
      "fontSize": 20,
      "verticalAlign": "middle"
  }, {
    "w": 100,
    "h": 100
  })

  expect(result._paddingTop).toBe(0)
  expect(result._paddingBottom).toBe(0)
  expect(result.padding).toBeUndefined()
  expect(result.verticalAlign).toBe('middle')

});
