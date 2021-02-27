import ModelTransformer from '../../src/qux/core/ModelTransformer'
import fixedFooter from './data/fixedFooter.json'

test('Test Fixed Parent correct', async () => {

  let t = new ModelTransformer(fixedFooter)
  let model = t.transform()

  expect(model).not.toBeNull()

  let screen = model.screens[1]
  expect(screen.name).toBe('Home')
  expect(screen.parent).toBeUndefined() // we should not have a parent. This was the bug
  expect(screen.cssSelector).not.toBe('.Home .Home')


  //console.debug(TestUtil.print(screen))
});