
import ModelTransformer from '../../src/qux/core/ModelTransformer'
import * as Util from '../../src/qux/core/ExportUtil'
import * as TestUtil from './TestUtil'
import app from './data/widthError.json'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'

test('Test Nest Groups', () => {

  let t = new ModelTransformer(app)
  let model = t.transform()

  expect(model.screens.length).toBe(3)

  let screenStart = model.screens.find(s => s.name === 'Start')
  expect(screenStart).not.toBeNull()
  let startNotification1 = TestUtil.findOneElementsByName(screenStart, 'Notification1Background')
  expect(startNotification1.w).toBe(344)

  let startScenario1 = TestUtil.findOneElementsByName(screenStart, 'Scenario1')
  expect(startScenario1.w).toBe(344)



  let notificationScreen = model.screens.find(s => s.name === 'NotificationSoftCrying')
  expect(notificationScreen).not.toBeNull()
  // console.debug(Util.print(notificationScreen))

  let notificationBack = TestUtil.findOneElementsByName(notificationScreen, 'NotificationBackend')
  expect(notificationBack.w).toBe(344)

/**
   * Now lets check what is wrong with the margins
   */
 let compressed = new CSSOptimizer().runTree(model)
 let classes = new CSSFactory().generate(compressed)

 let cssScenario = TestUtil.findCSSBySelector(classes, '.Scenario1')[0]

 expect(cssScenario.code.indexOf('width: 92%;')).toBeGreaterThan(0)

 let cssNotificationBack = TestUtil.findCSSBySelector(classes, '.NotificationBackend')[0]

 /** They should have a grid, becasue there is a an overlap */
 expect(cssNotificationBack).not.toBeNull()
 //console.debug(cssNotificationBack)
 expect(cssNotificationBack.code.indexOf('width: 91%;')).toBe(-1)
 expect(cssNotificationBack.code.indexOf('width: 92%;')).toBeGreaterThan(0)


});
