import * as Util from "../core/ExportUtil"
import Logger from "../core/Logger"


export function transform(treeModel, config) {
	Logger.log(3, "Inline.transform () > enter", config)

	let elements = getTreeElements(treeModel)
	Logger.log(-1,  "Inline.transform () > elements", Object.keys(elements).length)

	for (let id in elements) {
		let element = elements[id]
		if (element.type === 'DynamicContainer' && element.props.dynamicChildren) {
			Logger.log(-1,  "Inline.transform () > inline", element.name, element.figmaComponentId)

			/**
			 * We have to set here the component class
			 */
			if (element.props.dynamicParent && elements[element.props.dynamicParent]) {
				let parent = elements[element.props.dynamicParent]
				element.cssComponentClasses = [parent.cssScreen]
			}

			/**
			 * Attention. We set here only references. This means the
			 * parent and css selectors are per so not correct
			 */
			element.children = []
			element.props.dynamicChildren.forEach(childId => {
				let childElement = elements[childId]
				if (childElement) {
					element.children.push(childElement)
				}
			})

		}
	}
	return treeModel
}

export function createCopy (element, count = 0) {
	let result = {
		id: element.id + ':' + count,
		name: element.name,
		style: Util.clone(element.style),
		props: Util.clone(element.props),
	}

	return result
}


function getTreeElements (treeModel) {
	let result = {}
	treeModel.screens.forEach(screen => {
		getChildElements(screen, result)
	})
	return result
}

function getChildElements (element, result) {
	result[element.id] = element
	if (element.children) {
		element.children.forEach(child => getChildElements(child, result))
	}
}