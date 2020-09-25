import * as Util from './ExportUtil'
import Logger from './Logger'
import * as Grid from './GridLayouter'

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
        this.hasRows = true
        this.fixSmallColumns = false

        /**
         * By default we will only attach labels in input fields
         */
        this.nodesWithLabelAttachment = ['TextBox', 'Password', 'TextArea']

        if (config.css) {
            Logger.log(1, 'ModelTransformer.constructor() > ', config.css)
            if (config.css.grid === true) {
                this.hasRows = false
            }
            if (config.css.fixSmallColumns) {
                this.fixSmallColumns = true
            }
            this.isForcePinnedLeft = config.css.pinnedLeft === true
            this.isForcePinnedRight = config.css.pinnedRight === true
            this.isForceFixedHorizontal = config.css.fixedHorizontal === true

            /**
             * We can also attach labels for Boxes and Buttons
             */
            if (config.css.attachLabels === true) {
                this.nodesWithLabelAttachment = ['TextBox', 'Password', 'TextArea', 'Box', 'Button']
            }
        }

        this._cloneId = 0
        this.config = config
        this.forceNesting = true

        this.textProperties = [
			'color', 'textDecoration', 'textAlign', 'fontFamily',
			'fontSize', 'fontStyle', 'fontWeight', 'letterSpacing', 'lineHeight'
        ]

        this.supportedWidgetTypes = [
            'Button', 'Box', 'Label', 'Container', 'Icon', 'Image', 'CheckBox', 'RadioBox', 'RadioBox2', 'HotSpot',
            'TextBox', 'Password', 'TextArea', 'Repeater', 'RadioGroup', 'CheckBoxGroup', 'ToggleButton',
            'Switch', 'DropDown', 'MobileDropDown', 'Stepper', 'HSlider', 'Date', 'DateDropDown',
            'SegmentButton', 'Rating', 'IconToggle', 'LabeledIconToggle', 'TypeAheadTextBox', 'Table',
            'Paging', 'BarChart', 'PieChart', 'MultiRingChart', 'RingChart', 'Vector', 'Timeline', 'Upload',
            'ChildrenToggle', 'Camera', 'UploadPreview'
        ]
    }

    transform () {
        let result = {
            id: this.model.id,
            name: this.model.name,
            templates: this.model.templates ? Object.values(this.model.templates): [],
            warnings: [],
            screens: []
        }

        this.model = this.prepareFlatModel(this.model, result)

        result = this.transformToNested(this.model, result)

        return result
    }

    prepareFlatModel (model, result) {
        Logger.log(3, 'ModelTranformer.prepareFlatModel () > enter')
        /**
         * Before we start, we create an inherited model!
         */
        model = Util.createInheritedModel(model)

        /**
         * Set forced left and right pinned
         */
        model = this.addForcedResize(model, this.isForcePinnedLeft, this.isForcePinnedRight, this.isForceFixedHorizontal)

        /**
         * Set default data binding
         */
        model = this.addDefaultDataBinding(model)

        /**
         * Set certain widgets horizontal fixed
         */
        model = this.fixHorizontal(model)

        /**
         * Make sure names are unique
         */
        model = this.fixNames(model)

        /**
         * Embedd links
         */
        model = this.addActions(model)

        /**
         * Make sure templates are inlined
         */
        this.setTemplateStyles(model, result)

        /**
         * Add here virtual elements for the groups
         */
        for (let screenID in model.screens){
            let screen = model.screens[screenID]
            model = this.addGroupWrapper(screen,  model)
        }

        return model
    }

    /**
     * Turn the flat model info nexted model
     */
    transformToNested (model, result) {
        Logger.log(3, 'ModelTranformer.transformToNested () > enter')
        for (let screenID in model.screens){
            let screen = model.screens[screenID]

            /**
             * First we build a hierachical parent child relation.
             */
            screen = this.transformScreenToTree(screen, model)

            /**
             * Add rows, columns and grid if needed
             */
            screen = this.layoutTree(screen, model)

            /**
             * Now we put the fixed stuff in the fixedChildren list
             */
            screen = this.setFixedChildren(screen, model)


            /**
             * Now we need to layout the shit again, because we have removed the fixed elements.
             * FIXME: Make the layoutTree method faster taht it also works with the fixedChildren
             */
            if (screen.fixedChildren&& screen.fixedChildren.length > 0) {
                Logger.log(1, 'ModelTransformer.transformToNested() > fixed elements require double layout')
                screen = this.layoutTree(screen, model)
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

            this.attachSingleLabelsInScreen(screen, this.nodesWithLabelAttachment)

            this.setWidgetTypes(screen)

            result.screens.push(screen)
        }

        //this.attachSingleLabels(result, this.nodesWithLabelAttachment)

        return result
    }


    /**
     * Set tenplates in widgets
     */
    setTemplateStyles (model, result) {
        result.templates.forEach(t => {
            t.cssSelector = `.qux-template-${t.name.replace(/\s+/g, '_')}`
            t.cssClass = `qux-template-${t.name.replace(/\s+/g, '_')}`
            Object.values(model.widgets).forEach(widget => {
                if (widget.template === t.id) {
                    if (!widget.sharedCssClasses) {
                        widget.sharedCssClasses = []
                    }
                    widget.sharedCssClasses.push(t.cssClass)
                    /**
                     * The vertical align is copied directly... This should be some how handled
                     * by the css factory...
                     */
                    if (t.style && t.style.verticalAlign && !widget.style.verticalAlign) {
                        widget.style.verticalAlign = t.style.verticalAlign
                    }
                }
            })
        })
    }

    layoutTree (screen) {

        screen = this.addRows(screen)
        screen = this.addRowContainer(screen)

        screen = this.setOrderAndRelativePositions(screen, false)
        this.fixParents(screen)

        screen = this.addGrid(screen)
        return screen
    }

    setWidgetTypes (parent) {
        parent.qtype = this.getWidgetType(parent)
        if (parent.children) {
            parent.children.forEach(c => {
                this.setWidgetTypes(c)
            })
        }
        if (parent.fixedChildren) {
            parent.fixedChildren.forEach(c => {
                this.setWidgetTypes(c)
            })
        }
        if (parent.templates) {
            parent.templates.forEach(c => {
                this.setWidgetTypes(c)
            })
        }
    }

    setCSSClassNames (parent, screenName) {
        let name = parent.name
        name = name.replace(/\./g, '_')
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

    getWidgetType (element) {
        /**
         * We check here different component overrides
         */
        if (element.props.customComponent) {
            Logger.log(-1, 'ModelTRansformer.getWidgetType() > Use customComponent', element)
            return element.props.customComponent
        }

        if (element.children && element.children.length > 0) {
            if (element.type === 'Repeater') {
                return 'qRepeater'
            }
            if (element.type === 'ChildrenToggle') {
                return 'qChildrenToggle'
            }
            return 'qContainer'
        } else {
            if (this.supportedWidgetTypes.indexOf(element.type) >= 0) {
                return `q${element.type}`
            }
            Logger.warn('ModelTRansformer.getWidgetType() > Not supported widget type: ' + element.type)
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

    addForcedResize (model, isForcePinnedLeft, isForcePinnedRight, isForceFixedHorizontal) {
        if (isForcePinnedLeft || isForcePinnedRight || isForceFixedHorizontal) {
            Logger.log(2, 'ModelTransformer.addForcedResize()', isForcePinnedLeft, isForcePinnedRight)
            Object.values(model.widgets).forEach(w => {
                if (!w.props.resize) {
                    w.props.resize = {
                        right: false,
                        up: false,
                        left: false,
                        down: false,
                        fixedHorizontal: false,
                        fixedVertical: false
                    }
                }
                if (isForcePinnedLeft) {
                    w.props.resize.left = true
                }
                if (isForceFixedHorizontal && !w.props.right) {
                    w.props.resize.fixedHorizontal = true
                }
                if (isForcePinnedRight && !w.props.fixedHorizontal) {
                    w.props.resize.right = true
                }
            })
        }

        return model
    }

    addGrid (screen) {
        Grid.addGridToElements(screen)
        return screen
    }


    setOrderAndRelativePositions (parent, relative) {
        Logger.log(5, 'ModelTransformer.setOrderAndRelativePositons() > enter', parent.name)

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

            if (parent.isGroup) {
                /*
                * If the parent is group, the offet will be 0! So we calculate instead
                * the didtance between the first and second row and first and second column.
                * This is offcourse just guess.
                */

                let offsetBottom = 10
                let offSetRight = 10
                let rows = Util.getElementsAsRows(nodes)
                if (rows[0] && rows[0].length > 1 && rows[1]) {
                    let firstRowChild1 = rows[0][0]
                    let firstRowChild2 = rows[0][1]
                    let secondRowChild2 = rows[1][0]
                    offSetRight = firstRowChild2.x - (firstRowChild1.x + firstRowChild1.w)
                    offsetBottom = secondRowChild2.y - (firstRowChild1.y + firstRowChild1.h)
                } else {
                    Logger.log(-1, 'ModelTransformer.setOrderAndRelativePositons() > cannot guess offsets for Wrapper Container', parent.name)
                }

                parent.style.paddingTop = 0
                parent.style.paddingBottom = 0
                parent.style.paddingLeft = 0
                parent.style.paddingRight = 0

                nodes.forEach((n) => {
                    n.wrapOffSetBottom = offsetBottom
                    n.wrapOffSetRight = offSetRight
                    n.wrapOffSetY = 0
                    n.wrapOffSetX = 0
                })

            } else {
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
                    n.wrapOffSetY = offSetY
                    n.wrapOffSetX = offSetX
                })
            }

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
                this.setOrderAndRelativePositions(n, relative)
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
        Object.values(model.screens).forEach(s => {
            let lines = Util.getLines(s, model, true)
            if (lines.length > 0) {
                s.lines = lines
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
                        if (!widget.props.databinding || Object.values(widget.props.databinding) === 0) {
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

    fixNames (model) {
        let screens = Object.values(model.screens)
        screens.forEach((screen, j) => {

            let otherScreensWithSameName = screens.filter(o => o.name === screen.name)
            if (otherScreensWithSameName.length > 1) {
                Logger.log(3, 'ModelTRansformer.fixNames() > Fix double screen name:' + screen.name)
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
                        Logger.log(3, 'ModelTRansformer.fixNames() > Fix double widget name: ' + w.name + " in screen " + screen.name)
                        w.name += '_' + i
                    }
                })
            }
        })


        /**
         * DEPREACTED SHOULD NEVER BE CALLED: We should fix doubles names. With mastre screens
         * we could have overwites! We could rename them, but this
         * would have to be consistant in all screens!
         */
        for (let screenID in model.screens){
            let screen = model.screens[screenID]
            let children = screen.children
            let names = children.map(c => model.widgets[c].name)
            let count = {}
            names.forEach(n => {
                if (count[n]) {
                    Logger.error(`ModelTRansformer.fixNames() > Dubplicate name of element '${n}' in screen '${screen.name}'`)
                }
                count[n] = true
            })
        }
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


	attachSingleLabels (model, allowedTypes = null) {
        Logger.log(-1, 'ModelTransformer.attachSingleLabels()', allowedTypes)
		model.screens.forEach(screen => {
			screen.children.forEach(child => {
				this.attachSingleLabelsInNodes(child, allowedTypes)
			})
		})
		return model
	}

    attachSingleLabelsInScreen (screen, allowedTypes = null) {
        Logger.log(3, 'ModelTransformer.attachSingleLabelsInScreen()', allowedTypes)
        screen.children.forEach(child => {
            this.attachSingleLabelsInNodes(child, allowedTypes)
        })
		return screen
    }

	attachSingleLabelsInNodes (node, allowedTypes) {

		/**
		 * If we have a box that has NO label props and contains
		 * only one child of type label, we merge this in.
		 */
        let type = node.type

        if (!node.props.label && node.children.length === 1 && (allowedTypes === null || allowedTypes.indexOf(type) >= 0)) {

            let child = node.children[0]
            /**
             * TODO: We should check here if teh re is a link. What to do with the link?
             * Copy to aprent if it is different?
             */
            let lines = Util.getLines(child, this.model)
            if (child.type === 'Label' && lines.length === 0) {
                Logger.log(4, 'ModelTransformer.attachSingleLabelsInNodes()', node)
                node.props.label = child.props.label
                node.children = []
                /**
                 * For none input types set to Box
                 */
                if (!Util.isInputElement(node)) {
                    node.type = 'Box'
                    node.qtype = 'qBox'
                }
                this.textProperties.forEach(key => {
                    if (child.style[key]) {
                        node.style[key] = child.style[key]
                    }
                })
                node.style.paddingTop = child.y
                node.style.paddingBottom = node.h - child.h - child.y

                if (node.style.textAlign !== 'center') {
                    /**
                     * this can cause issues in the grid because
                     * the element minWidth getsto large
                     */
                    node.style.paddingLeft = child.x
                    node.style.paddingRight = node.w - child.w - child.x
                }
                node.style = Util.fixAutos(node.style, child)
            }
        } else {
            node.children.forEach(child => {
                this.attachSingleLabelsInNodes(child, allowedTypes)
            })
        }
	}

    /**
     * Remove single childs, if they have the same size as the parent.
     */
    cleanUpContainer (parent) {
        let nodes = parent.children

        nodes.forEach(node => {
            if (node.children.length === 1) {
                //console.debug("cleanUpContainer", node.name, node.children.length)
                let child = node.children[0]
                if (this.isEqualBox(node, child)) {
                    Logger.log(-1, 'ModelTranformer.cleanUpContainer()', child)
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

    isEqualBox (parent, child) {
        return child.x === 0 && child.y === 0 && child.w === parent.w && child.h === parent.h
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
         * For each row create a container and reposition the children.
         *
         * For wrappend and grid containers, we do not do this.
         *
         * FIXME: For groups we should not need to add a now row?
         *
         */
        if (!Util.isWrappedContainer(parent) && !Util.isGridContainer(parent) && this.hasRows) {
            for (let row in rows) {
                let children = rows[row]
                let container = this.createRowCntr(parent, children)
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

    createRowCntr (parent, children) {
        let boundingBox = Util.getBoundingBoxByBoxes(children)
        let rowCntr = {
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
        return rowCntr
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

    addGroupWrapper (screen, model) {
        Logger.log(4, "ModelTransformer.addGroupWrapper() > create ", screen.name)
        let widgets = Util.getOrderedWidgets(this.getWidgets(screen, model));

        let createdGroups = {}
        let order = []
        widgets.forEach(widget => {
            let group = Util.getGroup(widget.id, model)
            if (group) {
                this.createGroupCntr(group, model, createdGroups, order, screen)
            }
            order.push(widget)
        })

        /**
         * Set new z to ensure that the groups are before the
         */
        order.forEach((widget, i) => {
            widget.z = i
        })
        return model
    }

    createGroupCntr (group, model, createdGroups, order, screen) {
        /**
         * Create new group container only if needed
         */
        if (!createdGroups[group.id]) {
            Logger.log(2, "ModelTransformer.createGroupCntr() > create ", group.name)

            /**
             * 1) check if we need to create parent group. If so we go up hierachy
             */
            let parentGroup = Util.getParentGroup(group.id, model)
            if (parentGroup) {
                this.createGroupCntr(parentGroup, model, createdGroups, order, screen)
            }

            /**
             * 2) Now create the group cntr
             */
            let allGroupChildren = Util.getAllGroupChildren(group, model)

            let boundingBox = Util.getBoundingBoxByIds(allGroupChildren, model)

            let groupCntr = {
                id: `gc${group.id}`,
                name: group.name,
                groupId: group.id,
                isGroup: true,
                type: 'Box',
                x: boundingBox.x,
                y: boundingBox.y,
                w: boundingBox.w,
                h: boundingBox.h,
                style: group.style ? group.style : {},
                props: {
                    resize: group.props && group.props.resize ? group.props.resize : {
                        right: false,
                        up: false,
                        left: false,
                        down: false,
                        fixedHorizontal: false,
                        fixedVertical: false
                    }
                }
            }

            /**
             * For inhereted groups make sure that the inherited flag
             * is set, other wise the sortWidgets methods will put
             * it behind it's children and nesting does not work!
             */
            if (group.inherited) {
                groupCntr.inherited = group.inherited
            }

            /**
             * Add it to the model and link stuff properly
             */
            model.widgets[groupCntr.id] = groupCntr
            screen.children.push(groupCntr.id)
            createdGroups[group.id] = groupCntr

            /**
             * Attention, this is imporant! We add the groupCntr here.
             * After this method, the widget will be added! By doing this,
             * we ensure the right order.
             */
            order.push(groupCntr)
        }
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
        let widgets = Util.getOrderedWidgets(this.getWidgets(screen, model));

        /**
         *  now build child parent relations
         */
        let parentWidgets = []
        let elementsById = {}
        widgets.forEach(widget => {

            // console.debug('buildTree', widget.name, '    in ', parentWidgets.map(p => p.name).join(', '))

            let element = this.clone(widget);
            element._x = widget.x
            element._y = widget.y
            element.children = []

            let group = Util.getGroup(widget.id, model)
            element.group = group

            /**
             * Check if the widget has a parent (= is contained) widget.
             * If so, calculate the relative position to the parent,
             * otherwise but the element under the screen.
             */
            let parentWidget = this.getParentWidget(parentWidgets, element, model)

            if (parentWidget && Util.canBeChild(element, parentWidget)) { //  was Util.canHaveChildren(parentWidget)
                element.x = widget.x - parentWidget.x
                element.y = widget.y - parentWidget.y
                element.parent = parentWidget
                elementsById[parentWidget.id].children.push(element)
            } else {
                element.x = widget.x - screen.x
                element.y = widget.y - screen.y
                element.parent = null;
                result.children.push(element)

                /**
                 * If we have a widget directly under the screen, and we have a negative margin, crop
                 * This might happen with figma
                 */
                if (element.y < 0) {
                    Logger.log(2, 'ModelTransformer.transformScreenToTree() > fix negative margin', element.name)
                    element.h += element.y
                    element.y = 0
                }
            }

            /**
             * Save the widget, so we can check in the next
             * iteation if this is a parent or not! Only use
             * widgets that can have children
             */
            if (Util.canHaveChildren(widget)) {
                parentWidgets.unshift(widget)
            }
            elementsById[element.id] = element

        })

        /**
         * Padding messes with the grid :(
         */
        this.resetPadding(result)
        return result;
    }

    setFixedChildren (screen, model) {
        if (screen.children) {
            this.setFixedChildrenInElement(screen, screen, model)
        }
        return screen
    }

    setFixedChildrenInElement (element, screen, model) {

        /**
         * Attention. Fixed elements must be set in the model as fixed. Otherwise
         * the oder in the tree method is not correct and the will be wrongly nested!
         */
        if (element.children) {
            let children = []
            element.children.forEach(child => {
                if (child.style.fixed === true) {
                    child.x = child._x - screen.x
                    child.y = child._y - screen.y
                    element.parent = screen
                    this.setAllChildrenAsNotFixed(child)
                    // this.setFixedBottom(child, model)
                    screen.fixedChildren.push(child)
                } else {
                    this.setFixedChildrenInElement(child, screen, model)
                    children.push(child)
                }
            })
            element.children = children
        }

    }


    setFixedBottom(element, model) {
         /**
         * If an element (e.g. tabbar) is fixed at the bottom.
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
            Logger.log(2, 'ModelTransformer.setFixedChildrenInElement() > pinn fixed to bottom', element.name)
        }
        /**
         * IF we have an pinned bottom
         */
        if (Util.isPinnedDown(element)) {
            element.bottom = Util.getDistanceFromScreenBottom(element, model)
        }
    }

    setAllChildrenAsNotFixed (element) {
        if (element.children) {
            element.children.forEach(child => {
                child.style.fixed = false
                this.setAllChildrenAsNotFixed(child)
            })
        }
    }

    resetPadding (element) {
        if (element.children) {

            element.children.forEach(child => {
                /**
                 * If we have more than one child, we have to set the padding to 0.
                 * Also, we have to create an label element
                 */
                let labelToAdd = null
                if (child.children &&  child.children.length > 0) {
                    let style = child.style
                    if (child.props.label) {
                        let style = child.style
                        let paddingLeft = style.paddingLeft ? style.paddingLeft : 0
                        let paddingRight = style.paddingRight ? style.paddingRight : 0
                        let paddingBottom = style.paddingBottom ? style.paddingBottom : 0
                        let paddingTop = style.paddingTop ? style.paddingTop : 0
                         // Logger.warn('ModelTransformer.resetPadding() > inline label!', child)
                        labelToAdd = {
                            id: child.id + '-label',
                            name: child.name + '-label',
                            type: 'Label',
                            x: style.paddingRight,
                            y: style.paddingTop,
                            w: child.w - paddingLeft - paddingRight,
                            h: child.h - paddingBottom - paddingTop,
                            props: Util.clone(child.props),
                            style: {
                                color: style.color,
                                textAlign: style.textAlign,
                                fontFamily: style.fontFamily,
                                fontSize: style.fontSize,
                                fontStyle: style.fontStyle,
                                fontWeight: style.fontWeight,
                                letterSpacing: style.letterSpacing,
                                lineHeight: style.lineHeight,
                                verticalAlign: style.verticalAlign
                            },
                            children: []
                        }
                    }

                    style.paddingBottom = 0
                    style.paddingLeft = 0
                    style.paddingRight = 0
                    style.paddingTop = 0

                    this.resetPadding(child)

                    if (labelToAdd) {
                        /**
                         * Or add to fron?
                         */
                        child.children.push(labelToAdd)
                    }

                }
            })

        }
    }

    /**
     * This method will try to find the parent widget. By default,
     * the parent child relation ship is defined as the visual hierachy. This must be done, to
     * get nice nested HTML also from drawing style.
     *
     * Figma, however, might have overflows. Thus we check, if there is no visual parent,
     * also the parentID.
     */
    getParentWidget (potentialParents, element, model) {
        /**
         * First see if the widget is nested in a widget that was rendered before
         */
        for (let p = 0; p < potentialParents.length; p++){
            let parent = potentialParents[p];
            if (Util.isContainedInBox(element, parent)){
                return parent
            }
        }
        /**
         * If not, check of the parent was defined otherwise, e.g. figma.
         */
        if (element.parentId) {
            let parent = model.widgets[element.parentId]
            if (parent) {
                return parent
            }
        }
    }

    getWidgets (screen, model) {
        let widgets = [];
        for(let i=0; i < screen.children.length; i++){
            let id = screen.children[i];
            let widget = model.widgets[id];
            widgets.push(widget);
        }
        return widgets
    }

    escapeSpaces (s) {
        return s.replace(/\s+/g, '_')
    }

    clone (obj) {
        let clone = JSON.parse(JSON.stringify(obj))
        clone._id = this._cloneId++
        return clone
    }

}
