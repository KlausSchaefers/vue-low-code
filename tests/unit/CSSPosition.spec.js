
import CSSPosition from '../../src/qux/core/CSSPosition'

test('Test getGridColumnTracks', () => {


  let f = new CSSPosition({})
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

  let f = new CSSPosition({})
  let track = f.getGridRowTracks(600, [
    { v: 0, start: [{}], end: [], fixed: false, l: 50 },
    { v: 50, start: [{}, {}], end: [], fixed: false, l: 440 },
    { v: 490, start: [], end: [{},{}], fixed: false, l: 230 }
  ])
  expect(track).toBe('50px minmax(440px, auto) 1fr')

});


test('Test getGridColumnTracks max is fixed', () => {

  let f = new CSSPosition({})
  let track = f.getGridColumnTracks(440, [
    { v: 0, start: [{}], end: [], fixed: true, l: 200 },
    { v: 200, start: [{}, {}], end: [], fixed: true, l: 20}, // in figma haps are fixed
    { v: 220, start: [], end: [{},{}], fixed: false, l: 100 }, // this is the max
    { v: 320, start: [], end: [{},{}], fixed: true, l: 20 },
    { v: 340, start: [], end: [{},{}], fixed: false, l: 100 }
  ])
  expect(track).toBe('200px 20px minmax(0,1fr) 20px minmax(0,1fr)')


  track = f.getGridColumnTracks(440, [
    { v: 0, start: [{}], end: [], fixed: true, l: 200 },
    { v: 200, start: [{}, {}], end: [], fixed: true, l: 20}, // in figma haps are fixed
    { v: 220, start: [], end: [{},{}], fixed: false, l: 100 }, // this is the max
    { v: 320, start: [], end: [{},{}], fixed: true, l: 20 },
    { v: 340, start: [], end: [{},{}], fixed: true, l: 100 }
  ])
  expect(track).toBe('200px 20px minmax(0,1fr) 20px 100px')

  track = f.getGridColumnTracks(440, [
    { v: 0, start: [{}], end: [], fixed: false, l: 200 },
    { v: 200, start: [{}, {}], end: [], fixed: true, l: 20}, // in figma haps are fixed
    { v: 220, start: [], end: [{},{}], fixed: false, l: 100 }, // this is the max
    { v: 320, start: [], end: [{},{}], fixed: true, l: 20 },
    { v: 340, start: [], end: [{},{}], fixed: true, l: 100 }
  ])
  expect(track).toBe('minmax(0,1fr) 20px 22.7% 20px 100px')

  track = f.getGridColumnTracks(440, [
    { v: 0, start: [{}], end: [], fixed: true, l: 200 },
    { v: 200, start: [{}, {}], end: [], fixed: true, l: 20}, // in figma haps are fixed
    { v: 220, start: [], end: [{},{}], fixed: false, l: 150 }, // this is the max
    { v: 320, start: [], end: [{},{}], fixed: true, l: 20 },
    { v: 340, start: [], end: [{},{}], fixed: false, l: 100 }
  ])
  expect(track).toBe('200px 20px minmax(0,1fr) 20px 22.7%')


  track = f.getGridColumnTracks(440, [
    { v: 0, start: [{}], end: [], fixed: true, l: 200 },
    { v: 200, start: [{}, {}], end: [], fixed: true, l: 20}, // in figma haps are fixed
    { v: 220, start: [], end: [{},{}], fixed: false, l: 150 }, // this is the max
    { v: 320, start: [], end: [{},{}], fixed: false, l: 20 },
    { v: 340, start: [], end: [{},{}], fixed: false, l: 100 }
  ])
  expect(track).toBe('200px 20px minmax(0,1fr) 4.5% 22.7%')
});