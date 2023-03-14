import app from './data/validationApp.json'

import ModelTransformer from '../../src/qux/core/ModelTransformer'
import * as TestUtil from './TestUtil'

test('Test ValidationLabel', async () => {


  const t = new ModelTransformer(app, {
    css: {
      grid: true,
      attachLabels: true
    },
    addDefaultDatabinding: true
  })
  const model = t.transform()

  const screen = TestUtil.findScreen(model, 'Screen')
  const label = TestUtil.findOneElementsByName(screen, 'ErrorEmail')
  expect(label.props.errorLabelSource).not.toBe(null)
  expect(label.props.errorLabelSource).not.toBe(undefined)
  expect(label.props.errorLabelSource).toBe('w10003_12882')


   
});
  