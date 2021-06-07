import ModelTransformer from "../../src/qux/core/ModelTransformer"
import FigmaService from "../../src/qux/figma/FigmaService"
import figmaSwitchHover from "./data/figmaSwitchHover.json"
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'

import * as TestUtil from "./TestUtil"

test("Test parseFigmaAnitions", async () => {
	let data = [
		{
			action: {
				type: "NODE",
				destinationId: "1:10",
				navigation: "CHANGE_TO",
				transition: { type: "SMART_ANIMATE", easing: { type: "EASE_OUT" }, duration: 0.30000001192092896 },
				preserveScrollPosition: false,
			},
			trigger: { type: "ON_CLICK" },
		},
	]

	let figmaService = new FigmaService()
	let lines = figmaService.parseFigmaAnitions(data)
	expect(lines.length).toBe(1)
  expect(lines[0].event).toBe('click')

	data = [
		{
			action: {
				type: "NODE",
				destinationId: "6:5",
				navigation: "CHANGE_TO",
				transition: { type: "SMART_ANIMATE", easing: { type: "EASE_OUT" }, duration: 0.30000001192092896 },
				preserveScrollPosition: false,
			},
			trigger: { type: "ON_HOVER" },
		},
	]

	lines = figmaService.parseFigmaAnitions(data)
	expect(lines.length).toBe(1)
  expect(lines[0].event).toBe('hover')

	data = [
		{
			action: {
				type: "NODE",
				destinationId: "6:5",
				navigation: "CHANGE_TO",
				transition: { type: "SMART_ANIMATE", easing: { type: "EASE_OUT" }, duration: 0.30000001192092896 },
				preserveScrollPosition: false,
			},
			trigger: { type: "ON_CLICK" },
		},
		{
			action: {
				type: "NODE",
				destinationId: "1:10",
				navigation: "CHANGE_TO",
				transition: { type: "SMART_ANIMATE", easing: { type: "EASE_OUT" }, duration: 0.30000001192092896 },
				preserveScrollPosition: false,
			},
			trigger: { type: "MOUSE_LEAVE", delay: 0 },
		},
	]
  lines = figmaService.parseFigmaAnitions(data)
	expect(lines.length).toBe(2)
	//console.debug(JSON.stringify(JSON.parse("[{\"action\":{\"type\":\"NODE\",\"destinationId\":\"6:5\",\"navigation\":\"CHANGE_TO\",\"transition\":{\"type\":\"SMART_ANIMATE\",\"easing\":{\"type\":\"EASE_OUT\"},\"duration\":0.30000001192092896},\"preserveScrollPosition\":false},\"trigger\":{\"type\":\"ON_CLICK\"}},{\"action\":{\"type\":\"NODE\",\"destinationId\":\"1:10\",\"navigation\":\"CHANGE_TO\",\"transition\":{\"type\":\"SMART_ANIMATE\",\"easing\":{\"type\":\"EASE_OUT\"},\"duration\":0.30000001192092896},\"preserveScrollPosition\":false},\"trigger\":{\"type\":\"MOUSE_LEAVE\",\"delay\":0}}]")))
})

function test2() {}
test("Test Figma Animation - Smart Component", async () => {
	/**
	 * first call figma service to check taht all the boolean stuff and so is ignored
	 */
	let figmaService = new FigmaService()
	figmaService.setDownloadVectors(false)
	let app = await figmaService.parse(figmaSwitchHover.id, figmaSwitchHover)

	let instance = Object.values(app.widgets).find((w) => w.name === "Component 1")
	expect(instance).not.toBeUndefined()
	expect(instance.type).toBe("DynamicContainer")
	expect(instance.props.dynamicChildren.length).toBe(4)
	expect(instance.props.dynamicStart).not.toBeUndefined()
	expect(instance.props.dynamicLines).not.toBeUndefined()
	expect(instance.props.dynamicLines.length).toBe(6)

	/**
	 * Check if transform works correctly
	 */
	let t = new ModelTransformer(app, {
		css: {
			grid: true,
		},
	})
	let model = t.transform()

	expect(model).not.toBeNull()
	expect(model.screens.length).toBe(2)

	let componentScreen = model.screens[1]
	expect(componentScreen.isComponentScreen).toBe(true)
	expect(componentScreen.children.length).toBe(1)
	expect(componentScreen.children[0].children.length).toBe(4)



	console.debug(TestUtil.print(componentScreen, (e) => (e.props.figmaAnimation ? " - Animation" : " -  X")))
	let background = TestUtil.findOneElementsByName(componentScreen, 'Background_2')
	expect(background.style.borderBottomLeftRadius).toBe(50)

  let compressed = new CSSOptimizer().runTree(model)
  let classes = new CSSFactory().generate(compressed)

  // we had here the bug, that the elements will be compressed several times, because they
	// a referenced under the component screen, but also in the dynamic component
  let switchOff = TestUtil.findCSSBySelector(classes, '.Background_2')[0]
	expect(switchOff.code.indexOf('border: 1px solid rgba(0, 0, 0, 1);')).toBeGreaterThan(0)
	expect(switchOff.code.indexOf('border-radius: 50px;')).toBeGreaterThan(0)
	console.debug(switchOff.code)
})
