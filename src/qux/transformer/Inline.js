// import * as Util from "../core/ExportUtil"
import Logger from "../core/Logger"


export function transform(treeModel, config) {
	Logger.log(3, "Inline.transform () > enter", config)


	let elements = getTreeElements(treeModel)
	Logger.log(-1,  "Inline.transform () > elements", Object.keys(elements).length)
	//let cloneCount = 0
	for (let id in elements) {
		let element = elements[id]
		if (element.type === 'DynamicContainer' && element.props.dynamicChildren) {
			Logger.log(-1,  "Inline.transform () > inline", element.name, element.figmaComponentId)

			//let orignalChildren = element.children
			element.children = []
			element.props.dynamicChildren.forEach(childId => {
				let childElement = elements[childId]
				if (childElement) {
					// make somehow a copy
					//let clone = Util.clone(childElement)
					//clone.id = childElement.id + 'Clone' + cloneCount++
					//clone.x = 0
					//clone.y = 0
					element.children.push(childElement)
				}
				console.debug(childElement.figmaId)
			})

		}
	}





	return treeModel

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