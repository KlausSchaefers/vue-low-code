
import CSSFactory from '../../src/qux/core/CSSFactory'

test('Test getGridColumnTracks', () => {


  let f = new CSSFactory(true, '', true).positionFactory
  let track = f.getGridColumnTracks(600, [
    { v: 0, start: [], end: [], fixed: true, l: 100 },
    { v: 48, start: [], end: [], fixed: true, l: 100 },
    { v: 234, start: [], end: [], fixed: false, l: 200 }
  ])
  expect(track).toBe('100px 100px minmax(0,1fr)')

  track = f.getGridColumnTracks(600, [
    { v: 0, start: [], end: [], fixed: false, l: 150 },
    { v: 48, start: [], end: [], fixed: true, l: 100 },
    { v: 234, start: [], end: [], fixed: false, l: 200 }
  ])
  expect(track).toBe('25% 100px minmax(0,1fr)')
});



test('Test getGridRowTracks', () => {

  let f = new CSSFactory(true, '', true).positionFactory
  let track = f.getGridRowTracks(600, [
    { v: 0, start: [{}], end: [], fixed: false, l: 50 },
    { v: 50, start: [{}, {}], end: [], fixed: false, l: 440 },
    { v: 490, start: [], end: [{},{}], fixed: false, l: 230 }
  ])
  expect(track).toBe('50px minmax(440px, auto) 1fr')

});

