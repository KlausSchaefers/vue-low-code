// import * as Util from "../core/ExportUtil"
import Logger from "../core/Logger"
import * as Flat2Tree from './Flat2Tree'
/**
 * Get a sub tree. This
 */
export function transform(tree, selectedName, config, postFix = '-WrapperScreen') {
  Logger.log(0, "Tree2Component.transform () > enter", selectedName, postFix)

  let componentTree = {
    id: tree.id,
		name: tree.name,
		templates: tree.templates,
		warnings: [],
    screens: []
  }

  let matches = findElementsByName(tree, selectedName)
  if (matches.length === 1) {
    let match = matches[0]

    /**
     * We create here a wrapping screen
     */
    let screen = {
      id: match.id + postFix,
      name: match.name + postFix,
      x: match.x,
      y: match.y,
      w: match.w,
      h: match.h,
      qType: 'qContainer',
      type: 'Screen',
      cssClass: match.cssClass + postFix,
      cssSelector: `.qux-screen.${match.cssClass}${postFix}`,
      children: [match],
      fixedChildren: [],
      actions: [],
      props: {},
      style: {},
      isColumn: false,
      isRow: false,
      isWrap: false,
      isComponentScreen: true
    }
    componentTree.screens.push(screen)
    componentTree.id = match.id + '-' + componentTree.id

    /**
     * We make a special rendering (100% height) in the CSSFactory. This
     * we force a grid, but what ever...
     */
    match.hasComponentScreenParent = true

    /**
     * Do not forget to update the css Selectors
     */
    Flat2Tree.setCSSClassNames(match, match.name+postFix)

  } else if (matches.length > 1){
    Logger.error('Tree2Component.transform() > ERROR: More than one component with name', selectedName)
  } else {
    Logger.error('Tree2Component.transform() > ERROR: No component with name', selectedName)
  }

  return componentTree

}

export function findElementsByName (tree, name, result = []) {
  if (tree.screens) {
    tree.screens.forEach(screen => {
      findElementsByNameInScreen(screen, name, result)
    })
  }
  return result
}

export function findElementsByNameInScreen (e, name, result = []) {
  if (e.children) {
      e.children.forEach(c => {
          if (c.name === name) {
              result.push(c)
          }
          findElementsByName(c, name, result)
      })
  }
  return result
}