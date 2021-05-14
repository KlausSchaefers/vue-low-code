import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaDynamicToggle from './data/figmaDynamicToggle.json'


import * as TestUtil from './TestUtil'

test('Test Figma Dynamic', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaDynamicToggle.id, figmaDynamicToggle)


  /**
   * Make sure we have two screens and four widgets
   */
   expect(Object.values(app.screens).length).toBe(2)
   expect(Object.values(app.widgets).length).toBe(10)
   expect(Object.values(app.lines).length).toBe(3) // there is one line from the instance to the component

   let instance = Object.values(app.widgets).find(w => w.name === 'Instance 1')
   expect(instance).not.toBeUndefined()
   expect(instance.type).toBe('DynamicContainer')
   expect(instance.props.dynamicChildren.length).toBe(2)
   expect(instance.props.dynamicStart).not.toBeUndefined()
   expect(instance.props.dynamicLines).not.toBeUndefined()
   expect(instance.props.dynamicLines.length).toBe(2)

   let comp1 = Object.values(app.widgets).find(w => w.name === 'Component 1-ToggleOn')
   expect(comp1).not.toBeUndefined()
   expect(comp1.props.dataValue).toBe('true')

   let comp2 = Object.values(app.widgets).find(w => w.name === 'Component 1-ToggleOff')
   expect(comp2).not.toBeUndefined()
   expect(comp2.props.dataValue).toBe('false')

  /**
   * Check if transform works correctly
   */
  let t = new ModelTransformer(app, {
    css: {
      grid: true
    }
  })
  let model = t.transform()

  expect(model).not.toBeNull()
  expect(model.screens.length).toBe(2)

  let componentScreen = model.screens[0]

  expect(componentScreen.isComponentScreen).toBe(true)
  expect(componentScreen.children.length).toBe(1)
  expect(componentScreen.children[0].children.length).toBe(2)

  let screen = model.screens[1]
  console.debug(TestUtil.print(screen))
  expect(screen.isComponentScreen).toBeUndefined()
  expect(screen.children.length).toBe(1)

  let instance2 = screen.children[0]
  // make sure elements are inlined
  expect(instance2.type).toBe('DynamicContainer')
  expect(instance2.children.length).toBe(2)
  //console.debug(TestUtil.print(componentScreen))
  //console.debug(TestUtil.print(screen))




});