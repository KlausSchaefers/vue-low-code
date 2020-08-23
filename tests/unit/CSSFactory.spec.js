
import CSSFactory from '../../src/qux/core/CSSFactory'


test('Test getGridTracks', () => {


  let f = new CSSFactory(true, '', true)
  let track = f.getGridColumnTracks(600, [
    { v: 0, start: [Array], end: [], fixed: true, l: 100 },
    { v: 48, start: [Array], end: [], fixed: true, l: 100 },
    { v: 234, start: [], end: [Array], fixed: false, l: 200 }
  ])
  expect(track).toBe('100px 100px minmax(0,1fr)')

  track = f.getGridColumnTracks(600, [
    { v: 0, start: [Array], end: [], fixed: false, l: 150 },
    { v: 48, start: [Array], end: [], fixed: true, l: 100 },
    { v: 234, start: [], end: [Array], fixed: false, l: 200 }
  ])
  expect(track).toBe('25% 100px minmax(0,1fr)')
});

