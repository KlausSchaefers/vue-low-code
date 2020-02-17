import * as Util from './ExportUtil'
import Logger from './Logger'

/**
 * This class transforms an absolute quant-ux model into an
 * kind of HTML model, where the elements have a real parent
 * child relation child
 */
export default class ModelTransformer {

    constructor (app, config = {}) {
        this.model = app
        this.rowContainerID = 0
        this.columnContainerID = 0
        this.removeSingleLabels = true
        if (config.css) {
            Logger.log(1, 'ModelTransformer.constructor() > ', config.css)
            this.isGrid = config.css.grid === true
        }
  
        this._cloneId = 0
        this.config = config
        this.forceNesting = true

        this.textProperties = [
			'color', 'textDecoration', 'textAlign', 'fontFamily',
			'fontSize', 'fontStyle', 'fontWeight', 'letterSpacing', 'lineHeight'
        ]
        
        this.supportedWidgetTypes = [
            'Button', 'Box', 'Label', 'Container', 'Icon', 'Image', 'CheckBox', 'RadioBox', 'RadioBox2', 
            'TextBox', 'Password', 'TextArea', 'Repeater', 'RadioGroup', 'CheckBoxGroup', 'ToggleButton',
            'Switch', 'DropDown', 'MobileDropDown', 'Stepper', 'HSlider', 'Date', 'DateDropDown',
            'SegmentButton', 'Rating', 'IconToggle', 'LabeledIconToggle', 'TypeAheadTextBox', 'Table'
        ]
    }

    transform (relative = true) {
        let result = {
            id: this.model.id,
            name: this.model.name,
            templates: this.model.templates ? Object.values(this.model.templates): [],
            warnings: [],
            screens: []
        }

        /**
         * Before we start, we create an inherited model!
         */
        this.model = Util.createInheritedModel(this.model)

        /**
         * Flatten all groups
         */
        this.model = this.flattenGroups(this.model)

        /**
         * Set default data binding
         */
        this.model = this.addDefaultDataBinding(this.model)

        /**
         * Set certain widgets horizontal fixed
         */
        this.model = this.fixHorizontal(this.model)

        /**
         * Make sure names are unique
         */
        this.model = this.fixNames(this.model, result)

        /**
         * FIXME: fix doubles names
         */

        /**
         * Embedd links
         */
        this.model = this.addActions(this.model)

        /**
         * FIXME: We should fix doubles names. With mastre screens
         * we could have overwites! We could rename them, but this
         * would have to be consistant in all screens!
         */
        for (let screenID in this.model.screens){
            let screen = this.model.screens[screenID]
            let children = screen.children
            let names = children.map(c => this.model.widgets[c].name)
            let count = {}
            names.forEach(n => {
                if (count[n]) {
                    result.warnings.push(`Dubplicate name of element '${n}' in screen '${screen.name}'`)
                }
                count[n] = true
            })
        }


        for (let screenID in this.model.screens){
            let screen = this.model.screens[screenID]

            /**
             * First we build a hierachical parent child relation.
             */
            screen = this.transformScreenToTree(screen, this.model)

            /**
             * If we do not do a responsive layout we have to add rows
             * and columns to make 'old school' layout.
             */
            if (!this.isGrid) {
                screen = this.addRows(screen)
                screen = this.addRowContainer(screen)

                screen = this.addColumns(screen)
                screen = this.addColumnsContainer(screen)

                screen = this.cleanUpContainer(screen)
                screen = this.setOrderAndRelativePositons(screen, relative)

                this.fixParents(screen)

            } else {
                screen = this.addGroupCntr(screen)

                screen = this.addRows(screen)
                screen = this.addRowContainer(screen)

                screen = this.setOrderAndRelativePositons(screen, false)
                this.fixParents(screen)

                screen = this.addGrid(screen)
            }
            
            /**
             * set screen pos to 0,0
             */
            screen.children.forEach(c => {
                c.parent = screen
            })
            screen.x = 0
            screen.y = 0
            
            this.setCSSClassNames(screen, screen.name)

            this.setWidgetTypes(screen, result)

            result.screens.push(screen)
        }

        if (this.removeSingleLabels) {
            this.attachSingleLabels(result)
        }

        /**
         * If we have warnings, lets print them
         */
        result.warnings.forEach(w => {
            console.warn(w)
        })

        return result
    }

    setWidgetTypes (parent, result) {
        parent.qtype = this.getWidgetType(parent, result)
        if (parent.children) {
            parent.children.forEach(c => {
                this.setWidgetTypes(c, result)
            })
        }
        if (parent.fixedChildren) {
            parent.fixedChildren.forEach(c => {
                this.setWidgetTypes(c, result)
            })
        }
        if (parent.templates) {
            parent.templates.forEach(c => {
                this.setWidgetTypes(c, result)
            })
        }
    }

    setCSSClassNames (parent, screenName) {
        let name = parent.name
        let cssSelector = `.${name.replace(/\s+/g, '_')}`
        parent.cssClass = `${name.replace(/\s+/g, '_')}`
        if (parent.parent) {
            cssSelector = `.${screenName.replace(/\s+/g, '_')} ${cssSelector}`
            // cssClass = `${screenName.replace(/\s+/g, '_')} ${cssClass}`
        } else {
            cssSelector = `.qux-screen${cssSelector}`
            // cssClass = `qux-screen ${cssClass}`
        }
        parent.cssSelector = cssSelector
       
        if (parent && parent.children) {
            parent.children.forEach(c => {
                this.setCSSClassNames(c, screenName)
            })
        }
        if (parent && parent.fixedChildren) {
            parent.fixedChildren.forEach(c => {
                this.setCSSClassNames(c, screenName)
            })
        }
    }

    getWidgetType (element, result) {
        // check if an overwrite matches
        if (this.config.components) {
            let matches = this.config.components.filter(o => {
                if (o.qType) { 
                    return o.type === element.type
                }
                if (o.cssSelector) {
                    return element.cssSelector === o.cssSelector
                }
            })
            if (matches.length > 0) {
                if (matches.length === 1) {
                    element.isCustomComponent = true
                    let match = matches[0]
                    return match.type
                } else {
                    Logger.warn('ModelTRansformer.getWidgetType() > Too many matches for', element)
                }
            }
        }

        if (element.children && element.children.length > 0) {
            if (element.type === 'Repeater') {
                return 'qRepeater'
            }
            return 'qContainer'
        } else {
            if (this.supportedWidgetTypes.indexOf(element.type) >= 0) {
                return `q${element.type}`
            }
            result.warnings.push('Not supported widget type: ' + element.type)
            return 'qBox'
           
        }
    }

    fixParents (parent) {
        if (parent.children){
            parent.children.forEach(c => {
                c.parent = parent
                this.fixParents(c)
            })
        }
    }

    addGrid (screen) {
        this.addGridToElements(screen)
        return screen
    }

    addGridToElements (parent) {
        let grid = this.computeGrid(parent)
        if (grid) {
            parent.grid = grid
            if (parent.children && parent.children.length > 0) {
                parent.children.forEach(e => {
                    e.gridColumnStart = 0
                    e.gridColumnEnd = grid.columns.length
                    e.gridRowStart = 0
                    e.gridRowEnd = grid.rows.length
                    grid.columns.forEach((c, i) => {
                        if (c.v === e.x) {
                            e.gridColumnStart =  i
                        }
                        if (c.v === e.x + e.w) {
                            e.gridColumnEnd =  i
                        }
                    })
                    grid.rows.forEach((r, i) => {
                        if (r.v === e.y) {
                            e.gridRowStart =  i
                        }
                        if (r.v === e.y + e.h) {
                            e.gridRowEnd =  i
                        }
                    })
                })

            }
        }

        
        if (parent.children && parent.children.length > 0) {
            parent.children.forEach(c => {
                this.addGridToElements(c)
            })
        }

        return parent
    }

    computeGrid (parent) {  
        if (parent.children && parent.children.length > 0) {
            let rows = {}
            let columns = {}

            /**
             * Collect all the relevant lines. First the parent
             * then all the children
             */
            this.addGridColumns(columns, 0, parent, true)
            this.addGridColumns(columns, parent.w, parent, false)
            this.addGridRow(rows, 0, parent, true)
            this.addGridRow(rows, parent.h, parent, false)

            parent.children.forEach(c => {
                this.addGridColumns(columns, c.x, c, true)
                this.addGridColumns(columns, c.x + c.w, c, false)
                this.addGridRow(rows, c.y, c, true)
                this.addGridRow(rows, c.y + c.h, c, false)
            })
          
            /**
             * Set the width and convert objects to arrays
             */
            columns = this.setGridColumnWidth(columns, parent)
            rows = this.setGridRowHeight(rows, parent)

            /**
             * determine fixed columns and rows
             */
            this.setFixedGirdRowsAndColumns(parent, columns, rows)

            return {
                rows: rows,
                columns: columns
            }
        }
        return null
    }

    setFixedGirdRowsAndColumns (parent, columns, rows) {
         /**
          * Set fixed. For each child check if the 
          * 1) We have fixed Vertical or Horizontal
          * 2) If pinned. e.g. if pinned right, all
          *    columns < e.v must be fixed
          */
        parent.children.forEach(e => {
            if (Util.isFixedHorizontal(e)) {
                columns.forEach(column => {
                    if (column.v >= e.x && column.v < e.x + e.w) {
                        column.fixed = true
                    }
                })
            }
            if (Util.isPinnedLeft(e)) {
                // FIXME: Just fix the closest
                let before = columns.filter(column => column.v < e.x)
                if (before.length > 0) {
                    before[before.length-1].fixed = true
                }
                //columns.forEach(column => {
                //    if (column.v < e.x) {
                //        column.fixed = true
                //    }
                //})
            }
            if (Util.isPinnedRight(e)) {
                let after = columns.filter(column => column.v >= e.x + e.w)
                if (after.length > 0) {
                    after[0].fixed = true
                }
                //columns.forEach(column => {
                //    if (column.v >= e.x + e.w) {
                //        column.fixed = true
                //    }
                //})
            }

            if (Util.isFixedVertical(e)) {
                rows.forEach(row => {
                    if (row.v >= e.y && row.v < e.y + e.h) {
                        row.fixed = true
                    }
                })
            }

            if (Util.isPinnedUp(e)) {
                rows.forEach(row => {
                    if (row.v < e.y) {
                        row.fixed = true
                    }
                })
            }
            if (Util.isPinnedDown(e)) {
                rows.forEach(row => {
                    if (row.v >= e.y + e.h) {
                        row.fixed = true
                    }
                })
            }
        })
    }

    setGridColumnWidth (columns, parent) {
        columns = Object.values(columns).sort((a,b) => a.v - b.v)
        columns.forEach((column, i) => {
            if (columns[i + 1]) {
                column.l = columns[i + 1].v - column.v
            } else {
                column.l = parent.w - column.v
            }
        })
        return columns.filter(c => c.l > 0)
    }

    setGridRowHeight (rows, parent) {
        rows = Object.values(rows).sort((a,b) => a.v - b.v)
        rows.forEach((row, i) => {
            if (rows[i + 1]) {
                row.l = rows[i + 1].v - row.v
            } else {
                row.l = parent.h - row.v
            }
        })
        return rows.filter(r => r.l > 0)
    }

    addGridColumns (columns, x, e, start) {
        if (!columns[x]) {
            columns[x] = {
                v: x,
                start: [],
                end: [],
                fixed: false
            }
        }
        if (start) {
            columns[x].start.push(e)
        } else {
            columns[x].end.push(e)
        }
    }

    addGridRow (rows, y, e, start) {
        if (!rows[y]) {
            rows[y] = {
                v: y,
                start: [],
                end: [],
                fixed: false
            }
        }
        if (start) {
            rows[y].start.push(e)
        } else {
            rows[y].end.push(e)
        }
    }


    setOrderAndRelativePositons (parent, relative) {
        // Logger.log(1, 'ModelTransformer.setOrderAndRelativePositons() > enter', parent.name)
        /**
         * FIXME: If we do not force rows, the parent element
         * might no sort correcty
         */
        let nodes = parent.children
        if (Util.isWrappedContainer(parent)) {
            Logger.log(3, 'ModelTransformer.setOrderAndRelativePositons() > Wrapper Container', parent.name)

            /**
             * Sort by bz row and column
             */
            nodes.sort((a,b) => {
                if (Util.isOverLappingY(a, b)) {
                    return a.x - b.x
                }
                return a.y - b.y
            })
   
            /**
             * We take as the position, the offset of the first element
             * Then we add half as padding and the rest a masgin for 
             * the children
             */
            let firstNode = nodes[0]
            let offSetX = Math.round(firstNode.x / 2)
            let offSetY = Math.round(firstNode.y / 2)
            parent.style.paddingTop = offSetY
            parent.style.paddingBottom = offSetY
            parent.style.paddingLeft = offSetX
            parent.style.paddingRight = offSetX
            nodes.forEach((n) => {
                n.wrapOffSetY = firstNode.y - offSetY
                n.wrapOffSetX = firstNode.x - offSetX
                // console.debug('absX', n.name, n.x, n.absX)
            })

            /**
             * FIXME: can I calculate if we have to use justify-content: space-between?
             */
            

        } else if (parent.isRow){
            Logger.log(5, 'ModelTransformer.setOrderAndRelativePositons() > Row', parent.name)
            /**
             * In a row the elements are rendered form left to right
             */
            nodes.sort((a,b) => {
                return a.x - b.x
            })
           
            let last = 0
            /**
             * We calculate now as x the position the the child before,
             * but we also save the absolute position
             */
            nodes.forEach((n,i) => {
                let x = n.x - last
                last = n.x + n.w
                n.absX = n.x 
                /**
                 * FIXME: add also right
                 */
                if (relative) {
                    n.x = x
                    n.c = i
                } else {
                    n.left = x
                    n.c = i
                }
                // console.debug('absX', n.name, n.x, n.absX)
            })


            /**
             * Update responsive propeties in rows
             */
            if (parent.props && parent.props.resize) {
                let lastNode = null
                nodes.forEach((node,i) => {
                    this.mergeResponsiveInParent(parent, node, i, nodes.length)
            
                    node.canGrow = true
                    /**
                     * Make right fixed, left fixed
                     */
                    if (lastNode && Util.isPinnedRight(lastNode)) {
                        Logger.log(5, 'ModelTRansformer.setOrderAndRelativePositons() > fix rightPinned :' + lastNode.name, node.name)
                        node.props.resize.left = true
                        node.canGrow = false
                    }
                    lastNode = node
                })
            }
           
            
        } else {
            Logger.log(5, 'ModelTransformer.setOrderAndRelativePositons() > Column', parent.name)
            /**
             * In a column, elements are rendered top to down
             */
            nodes.sort((a,b) => {
                return a.y - b.y
            })
            let last = 0
            nodes.forEach((n,i) => {
                let y = n.y - last
                last = n.y + n.h
                if (relative) {
                    n.y = y
                    n.r = i
                } else {
                    n.top = y
                }
            })
        }

        nodes.forEach(n => {
            if (n.children && n.children.length > 0 ){
                this.setOrderAndRelativePositons(n, relative)
            }
        })

        return parent
    }

    mergeResponsiveInParent (container, c, index, childrenCount) {
        if (container.props.resize) {
            if (index === 0) {
                Logger.log(5, "ModelTransformer.mergeResponsiveInParent() > left: " + container.name, Util.isPinnedLeft(c))
                container.props.resize.left = Util.isPinnedLeft(c)
            }
            if (index === childrenCount - 1) {
                Logger.log(5, "ModelTransformer.mergeResponsiveInParent() > right: " + container.name, Util.isPinnedRight(c))
                container.props.resize.right = Util.isPinnedRight(c)
            }
        }
    }

    addActions (model) {
        Object.values(model.widgets).forEach(w => {
            let lines = Util.getLines(w, model, true)
            if (lines.length > 0) {
                w.lines = lines
                lines.forEach(l => {
                    let screen = model.screens[l.to]
                    if (screen) {
                        l.screen = screen
                    }
                })
            }
        })
        return model
    }

    addDefaultDataBinding (model) {
  
        for (let screenId in model.screens) {
            let screen = model.screens[screenId]
            let children = screen.children
            if (children) {
           
                children.forEach(widgetId => {
                    let widget = model.widgets[widgetId]
                    if (widget && widget.props) {
                        if (!widget.props.databinding || !widget.props.databinding.default) {
                            widget.props.databinding = {
                                'default': this.getDefaultDataBinding(screen, widget)
                            }
                            Logger.log(4, 'ModelTransformer.addDefaultDataBinding() > ', widget.props.databinding)
                        }
                    }
                })
            }
        }
        return model
    }

    fixHorizontal (model) {
        let fixed = ['Switch', 'Stepper']
        for (let widgetId in model.widgets) {
            let widget = model.widgets[widgetId]
            if (fixed.indexOf(widget.type) >= 0) {
                if (!widget.props.resize) {
                    widget.props.resize = {}
                }
                widget.props.resize.fixedHorizontal = true
            }
        }

        return model
    }

    fixNames (model, result) {

        let screens = Object.values(model.screens)

  
        screens.forEach((screen, j) => {
            let otherScreensWithSameName = screens.filter(o => o.name === screen.name)
            if (otherScreensWithSameName.length > 1) {
                result.warnings.push('Fix double screen name:' + screen.name)
                screen.name += '_' + j
            }

            let children = screen.children
            if (children) {
                let widgets = children.map(widgetId => {
                    return model.widgets[widgetId]
                })
                
                widgets.forEach((w, i) => {
                    let others = widgets.filter(o => o.name === w.name)
                    if (others.length > 1) {
                        result.warnings.push('Fix double widget name: ' + w.name + " in screen " + screen.name)
                        w.name += '_' + i
                    } 
                })
            }
        })
        return model
    }

    getDefaultDataBinding (screen, widget) {
        /**
         * RadioBoxes need some special handling. We create a binding for the group if specified
         */
        if (widget.type === 'RadioBox2' && widget.props && widget.props.formGroup) {
            return  this.escapeSpaces(`${screen.name}.${widget.props.formGroup}`) 
        }
        return this.escapeSpaces(`${screen.name}.${widget.name}`)
    }

    escapeSpaces (s) {
        return s.replace(/\s+/g, '_')
    }


	attachSingleLabels (model) {
		model.screens.forEach(screen => {
			screen.children.forEach(child => {
				this.attachSingleLabelsInNodes(child)
			})
		})
		return model
	}

	attachSingleLabelsInNodes (node) {
		/**
		 * If we have a box that has NO label props and contains
		 * only one child of type label, we merge this in.
		 */
		if (!node.props.label && node.children.length === 1) {
			let child = node.children[0]
			if (child.type === 'Label') {
				node.props.label = child.props.label
				node.children = []
				this.textProperties.forEach(key => {
					if (child.style[key]) {
						node.style[key] = child.style[key]
					}
				})
				node.style.paddingTop = child.y
				node.style.paddingLeft = child.x
				node.style = Util.fixAutos(node.style, child)
			}
		} else {
			node.children.forEach(child => {
				this.attachSingleLabelsInNodes(child)
			})
		}
	}



    cleanUpContainer (parent) {
        let nodes = parent.children

        nodes.forEach(node => {
            if (node.children.length === 1) {
                //console.debug("cleanUpContainer", node.name, node.children.length)
                let child = node.children[0]
                if (this.isEqualBox(node, child)) {
                    node.children = child.children
                    node.children.forEach(c => {
                        c.parent = node
                    })
                }
            }
        })

        /**
         * Go down recursive
         */
        nodes.forEach(a => {
            if (a.children && a.children.length > 0 ){
                this.cleanUpContainer(a)
            }
        })
        return parent
    }

    addGroupCntr (parent) {
        let nodes = parent.children
    
        let groups = {}
        let newChildren = []
        nodes.forEach(n => {
            if (n.group) {
                let groupId = n.group.id
                if (!groups[groupId]) {
                    Logger.log(3, "ModelTransformer.addGroupCntr() > Create: " + n.group.name, n.group.id)
                    let groupCntr = {
                        id: n.group.id,
                        name: n.group.name,
                        isGroup: true,
                        children: [],
                        type: 'Box',
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
                    groups[groupId] = groupCntr
                    newChildren.push(groupCntr)
                }
                groups[groupId].children.push(n)
            } else {
                newChildren.push(n)
            }
        })


        /**
         * Calculate Bounding boxes
         */
        Object.values(groups).forEach(group => {
            let children = group.children
            let boundingBox = Util.getBoundingBoxByBoxes(children)
            group.x = boundingBox.x
            group.y = boundingBox.y
            group.w = boundingBox.w
            group.h = boundingBox.h
            
            children.forEach(child => {
                child.x = child.x - boundingBox.x
                child.y = child.y - boundingBox.y
            })
        })
        parent.children = newChildren

        /**
         * Go down recursive
         */
        nodes.forEach(a => {
            if (a.children && a.children.length > 0 ){
                this.addGroupCntr(a)
            }
        })
        return parent
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

    addRowContainer (parent) {
        let nodes = parent.children

        let newChildren = []
        let rows = {}
        nodes.forEach(a => {
            if (a.row) {
                if (!rows[a.row]) {
                    rows[a.row] = []
                }
                rows[a.row].push(a)
            } else {
                newChildren.push(a)
            }
        })

        /**
         * For each row create a container and reposition the children
         * 
         * FIXME: For groups we should not need to add a now row?
         */
        if (!Util.isWrappedContainer(parent)) {
            for (let row in rows) {
                let children = rows[row]
                let boundingBox = Util.getBoundingBoxByBoxes(children)
                let container = {
                    id: 'r' + this.rowContainerID++,
                    name: `Row ${this.rowContainerID}`,
                    children: children,
                    isRow: true,
                    x: boundingBox.x,
                    y: boundingBox.y,
                    h: boundingBox.h,
                    w: boundingBox.w,
                    type: 'row',
                    parent: parent,
                    style: {},
                    props: {
                        resize: {
                            right: false,
                            up: false,
                            left: false,
                            down: false,
                            /**
                             * check of all children are fixed width. Then we set this one too.
                             */
                            fixedHorizontal: Util.allChildrenAreFixedHorizontal(children),
                            fixedVertical: false
                        }
                    }
                }
                /**
                 * Position the children in the container
                 */
                children.forEach((c) => {
                    c.x = c.x - container.x,
                    c.y = c.y - container.y,
                    c.parent = container
                })
                

                newChildren.push(container)
            }
            parent.children = newChildren
        } else {
            if (parent.type !== 'Screen') {
                Logger.log(4, "ModelTransformer.addRowContainer() > ignore wrapper ", parent.name)
                parent.isWrap = true
                parent.isRow = false
                parent.isColumn  = false
            }
        }

        /**
         * Go down recursive
         */
        nodes.forEach(a => {
            if (a.children && a.children.length > 0 ){
                this.addRowContainer(a)
            }
        })
        return parent
    }

    /**
     * Sets the row IDS to each child
     */
    addRows (parent) {
        let nodes = parent.children
   
        nodes.sort((a, b) => {
            return a.y - b.y
        })
        // let rows = []
        let rowIDs = 1
        nodes.forEach(a => {
            nodes.forEach(b => {
                if (a.id !== b.id) {
                    if (Util.isOverLappingY(a,b)) {
                        /**
                         * If we have now row, create a new id for a
                         */
                        if (!a.row) {
                            a.row = rowIDs++
                        }
                      
                        /**
                         * If b has no row, we put it in the same row as
                         * a
                         */
                        if (!b.row) {
                            b.row  = a.row
                        } else {
                            let oldId = b.row
                            let newId = a.row
                            /**
                             * if b has already a row, we merge row a & b
                             */
                            nodes.forEach(c => {
                                if (c.row === oldId) {
                                    c.row = newId
                                }
                            })
                        }
                    }
                }

                /**
                 * no step down recursive
                 */
                if (a.children && a.children.length > 0 ){
                   this.addRows(a)
                }
            })
        })

        return parent
    }

    /**
     * Transforms and screen into a hiearchical presentation. return the root node.
     */
    transformScreenToTree(screen, model) {
        let result = this.clone(screen)
        delete result.children;
        delete result.has;
        result.children = []
        result.fixedChildren = []

        /**
         * Get widget in render order. This is important to derive the
         * parent child relations.
         */
        let widgets = Util.getOrderedWidgets(this.getWidgets(screen));

        /**
         * FIXME: also build tree for fixed children. This is currently very
         * ugly because we just produce and fixed layout. 
         * 
         * It would be bette to build one fixed container, and use the normal aligment
         * in it, to have responsove ness and so. 
         * 
         * 1) Make tow lists for fixed and not fixed
         * 2) Run the same code, but add different result lists. 
         *    So fixed elements get just nested in fixed ones. Would be somehow nice, 
         *    of this would somehow be natural?
         * 3) Pin the fixed elements to the bottom
         * 4) Add all is elements
         * 
         * For now it shall be ok, as we expect simple navbars and such...
         * 
         */


        /**
         *  now build child parent relations
         */
        let parentWidgets = []
        let elementsById = {}
        widgets.forEach(widget => {
            
            /**
             * FIXME: we should not clone here!
             */
            let element = this.clone(widget);
            element.children = []
            delete element.has

            let group = Util.getTopParentGroup(widget.id, model)
            if (group) {
                element.group = group
            }

            if (widget.style.fixed) {

                element.x = widget.x - screen.x
                element.y = widget.y - screen.y
                element.parent = screen
                result.fixedChildren.push(element)

                /**
                 * We pinn fixed elements at the bottom if they are fixed.
                 */
                if (Util.isAtBottom(element, model)) {
                    if (!element.props.resize) {
                        element.props.resize = {
                            right: false,
                            up: false,
                            left: false,
                            down: false,
                            fixedHorizontal: false,
                            fixedVertical: false
                        }
                    }
                    element.props.resize.down = true
                    Logger.log(0, 'ModelTransformer.transformScreenToTree() > pinn fixed to bottom', element.name)
                }
                /**
                 * IF we have an pinned bottom
                 */
                if (Util.isPinnedDown(element)) {
                    element.bottom = Util.getDistanceFromScreenBottom(element, model)
                }

             

            } else {
                /**
                 * Check if the widget has a parent (= is contained) widget.
                 * If so, calculate the relative position to the parent,
                 * otherwise but the element under the screen.
                 */
                let parentWidget = this.getParentWidget(parentWidgets, element)
                if (parentWidget) {
                    element.x = widget.x - parentWidget.x
                    element.y = widget.y - parentWidget.y
                    element.parent = parentWidget
                    elementsById[parentWidget.id].children.push(element)
                } else {
                    element.x = widget.x - screen.x
                    element.y = widget.y - screen.y
                    element.parent = null;
                    result.children.push(element)
                }
                /**
                 * Save the widget, so we can check in the next
                 * iteation if this is a parent or not!
                 */
                parentWidgets.unshift(widget)
                elementsById[element.id] = element
            }
        })
        return result;
    }

    flattenGroups (model) {
        let toDelete = []

        if (model.groups) {
            /**
             * Check for each  group if it is a child group.
             * If so, pull up children to top, and remove it
             */
            for (let id in model.groups) {
                let group = model.groups[id];
                let parentGroup = Util.getTopParentGroup(id, model)
                if (parentGroup && parentGroup.id !== group.id) {
                    toDelete.push(group.id)
                    let children = group.children
                    children.forEach(childId => {
                        if (parentGroup.children.indexOf(childId) < 0) {
                            parentGroup.children.push(childId)
                        }
                    })
                    Logger.log(2, "ModelTransformer.flattenGroups() > merge " + group.name, parentGroup.name)
                }
            }

            /**
             * Remove child groups
             */
            toDelete.forEach(id => {
                delete model.groups[id]
            })     
            
            /**
             * remove subgroups
             */
            for (let id in model.groups) {
                let group = model.groups[id];
                group.groups = []
            }
        }
        return model
    }


    getParentWidget (potentialParents, element){
        for (let p=0;p< potentialParents.length; p++){
            let parent = potentialParents[p];
            if (Util.isContainedInBox(element, parent)){
                return parent
            }
        }
    }

    getWidgets (screen) {
        let widgets = [];
        for(let i=0; i < screen.children.length; i++){
            let id = screen.children[i];
            let widget = this.model.widgets[id];
            widgets.push(widget);
        }
        return widgets
    }

    clone (obj) {
        let clone = JSON.parse(JSON.stringify(obj))
        clone._id = this._cloneId++
        return clone
    }

    isTop(from, to) {
		return (from.y) > (to.y + to.h);
	}

	isStartingTop(from, to) {
		return (from.y) >= (to.y); // && (from.y + from.h) <= (to.y + to.h);
	}

	isBottom(from, to) {
		return (from.y + from.h) < (to.y);
	}

	isLeft(from, to) {
		return (from.x) > (to.x + to.w);
	}

	isStartingLeft(from, to) {
		return (from.x) >= (to.x);
	}

	isRight(from, to) {
		return (from.x + from.w) < (to.x);
    }

    isEqualBox (parent, child) {
        return child.x === 0 && child.y === 0 && parent.w === child.w && parent.h === child.h
    }

}
