import { renderSync } from 'node-sass';
import RestEngine from '../../src/qux/core/RestEngine'

test('Test fillString()', async () => {

  let result = await RestEngine.fillString('http://localhost:8080/api?first=${selectedFirst.id}&second=${selectedSecond}', {
    'selectedFirst.id':1,
    'selectedSecond': 2
  })
  expect(result).toBe('http://localhost:8080/api?first=1&second=2')


});

test('Test getNeededDataBings()', async () => {

  let requiredDataBindings = RestEngine.getNeededDataBings({
    method: 'GET',
    url: 'http://localhost:8080/api?first=${selectedFirst.id}&second=${selectedSecond}',
    token: ''
  })
  expect(requiredDataBindings.length).toBe(2)
  expect(requiredDataBindings[0]).toBe('selectedFirst.id')
  expect(requiredDataBindings[1]).toBe('selectedSecond')

});
