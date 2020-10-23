import ModelTransformer from '../core/ModelTransformer'
import * as Util from '../core/ExportUtil'

export default class FlexModelTransformer extends ModelTransformer {

  constructor (app, config = {}) {
    super(app, config)
  }

  layoutTree (screen) {
    screen = this.addRows(screen)
    screen = this.addRowContainer(screen)

    screen = this.addColumns(screen)
    screen = this.addColumnsContainer(screen)

    screen = this.cleanUpContainer(screen)
    screen = this.setOrderAndRelativePositions(screen, true)

    this.fixParents(screen)

    return screen
  }

  addColumnsContainer (parent) {
    let nodes = parent.children

    let newChildren = []
    let columns = {}
    nodes.forEach(a => {
        if (a.column) {
            if (!columns[a.column]) {
                columns[a.column] = []
            }
            columns[a.column].push(a)
        } else {
            newChildren.push(a)
        }
    })

    /**
     * For each column create a container and reposition the children
     * when:
     * There a columns and newChildren
     */
    if (Object.values(columns).length > 0 && newChildren.length > 0 && !Util.isWrappedContainer(parent)) {
        for (let column in columns) {
            let children = columns[column]
            let hasParent = children.reduce((a,b) => b.parent != null & a, true)
            if (hasParent) {
                let boundingBox = Util.getBoundingBoxByBoxes(children)
                let container = {
                    id: 'c' + this.columnContainerID++,
                    name: `Column ${this.columnContainerID}`,
                    isColumn: true,
                    children: children,
                    x: boundingBox.x,
                    y: boundingBox.y,
                    h: boundingBox.h,
                    w: boundingBox.w,
                    type: 'column',
                    parent: parent,
                    style: {},
                    props: {
                        resize: {
                            right: false,
                            up: false,
                            left: false,
                            down: false,
                            fixedHorizontal: false,
                            fixedVertical: false
                        }
                    }
                }
                children.forEach((c) => {
                    c.x = c.x - container.x,
                    c.y = c.y - container.y,
                    c.parent = container
                })
                newChildren.push(container)
            } else {
                newChildren = children.concat(newChildren)
            }
        }
        parent.children = newChildren
    }

    /**
     * Go down recursive
     */
    nodes.forEach(a => {
        if (a.children && a.children.length > 0 ){
            this.addColumnsContainer(a)
        }
    })
    return parent
}


  /**
   * Assigns to each child a column
   */
  addColumns (parent) {
    let nodes = parent.children

    // let rows = []
    let columnIDs = 0
    nodes.forEach(a => {
        // console.debug(' addColumns()', a.name, ' @', parent.name)
        nodes.forEach(b => {
            if (a.id !== b.id) {
                if (Util.isOverLappingX(a,b) && a.parent) {
                    //console.debug('  same row', a.name, b.name)
                    /**
                     * If we have now row, create a new id for a
                     */
                    if (!a.column) {
                        a.column = columnIDs++
                    }
                    /**
                     * If b has no row, we put it in the same row as
                     * a
                     */
                    if (!b.column) {
                        b.column  = a.column
                    } else {
                        let oldId = b.column
                        let newId = a.column
                        /**
                         * if b has already a row, we merge row a & b
                         */
                        nodes.forEach(c => {
                            if (c.column === oldId) {
                                c.column = newId
                            }
                        })
                    }
                }
            }

            /**
             * no step down recursive
             */
            if (a.children && a.children.length > 0 ){
               this.addColumns(a)
            }
        })
    })
    return parent
  }
}