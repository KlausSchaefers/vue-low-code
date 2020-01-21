import Logger from "./Logger";

export function getFileName(name) {
    return name.replace(/\s/g, '_');
}

export function hasNoChildren(widget) {
    return widget.children && widget.children.length === 0
}

export function isLastChild(widget) {

    if(widget.parent && widget.parent.children){
        let parent = widget.parent
        let last = parent.children[parent.children.length-1]
        return last.id === widget.id
    }
    return false
}

/**
 * Determine if the grid is collection
 * of stacked rows
 */
export function isRowGrid(widget){
    let hasOverlaps = false
    if (widget){
        let nodes = widget.children
        nodes.forEach(a => {
            nodes.forEach(b => {
                if (a.id !== b.id) {
                    if (isOverLappingY(a,b)) {
                        hasOverlaps = true
                    }
                }
            })
        })
    }
    return !hasOverlaps
}

export function isOverLappingX(pos, box) {
    return !isLeft(pos, box) && !isRight(pos, box);
}

export function isOverLappingY(pos, box) {
    return !isTop(pos, box) && !isBottom(pos, box);
}

export function  isTop(from, to) {
    return (from.y) > (to.y + to.h);
}

export function  isStartingTop(from, to) {
    return (from.y) >= (to.y); // && (from.y + from.h) <= (to.y + to.h);
}

export function  isBottom(from, to) {
    return (from.y + from.h) < (to.y);
}

export function  isLeft(from, to) {
    return (from.x) > (to.x + to.w);
}

export function isStartingLeft(from, to) {
    return (from.x) >= (to.x);
}

export function isRight(from, to) {
    return (from.x + from.w) < (to.x);
}

export function isFixedHorizontal(e) {
    return e.props && e.props.resize && e.props.resize.fixedHorizontal
}

export function isFixedVertical(e) {
    if (e.type === 'Box' || e.type === 'Button' || 
        e.type === 'Container' || e.type === 'Repeater' || 
        (e.children && e.children.length > 0)
    ) {
        return e.props && e.props.resize && e.props.resize.fixedVertical
    }
    return true
}

export function isPinnedLeft(e) {
    return e.props && e.props.resize && e.props.resize.left
}

export function isPinnedRight(e) {
    return e.props && e.props.resize && e.props.resize.right
}

export function isPinnedUp(e) {
    return e.props && e.props.resize && e.props.resize.up
}

export function isPinnedDown(e) {
    return e.props && e.props.resize && e.props.resize.down
}

export function isSingleChildInRow() {
    //if (e.parent){
    //   let inSameRow = e.parent.children.filter(c => c.r === e.r)
    //   console.debug('isSIngleChild', e.name, e.parent.name, inSameRow)
    //    //return inSameRow.length === 1
    //}
    return false
}

export function isAtBottom(element, model, threshold = 10) {
    if (element && model.screenSize) {
        let dif = getDistanceFromScreenBottom(element, model)
        return dif < threshold
    }
    return false
}

export function getDistanceFromScreenBottom(element, model) {
    if (element && model.screenSize) {
        let dif = model.screenSize.h - (element.y + element.h)
        return dif;
    }
    return 0
}

export function isWrappedContainer(e) {
    return e.style.wrap
}

export function isRepeater(e) {
    if (e) {
        return e.type === 'Repeater'
    }
    return false
}

export function hasWrappedParent(e) {
    if (e.parent) {
        return e.parent.style.wrap
    }
    return false
}

export function hasGrid(e) {
    return e.grid
}

export function hasParentGrid(e) {
    if (e.parent) {
        return hasGrid(e.parent)
    }
    return false;
}

export function hasRowGrid(e) {
    return e.grid && e.grid.isRow
}

export function hasParentRowGrid(e) {
    if (e.parent) {
        return hasRowGrid(e.parent)
    }
    return false;
}

export function isRepeaterWrap (e) {
    if (e.type === 'Repeater' && e.props.layout == 'grid' && e.props.auto === true) {
        return true
    }
    return false
}

export function hasParentRepeaterWrap (e) {
    if (e.parent) {
        return isRepeaterWrap(e.parent)
    }
    return false
}

export function isRepeaterGrid (e) {
    if (e.type === 'Repeater' && e.props.layout == 'grid' && e.props.auto === false) {
        return true
    }
    return false
}

export function hasParentRepeaterGrid (e) {
    if (e.parent) {
        return isRepeaterGrid(e.parent)
    }
    return false
}

export function getClickLine(element) {
    if (element.lines) {
        return element.lines.find(l => l.event === 'click')
    }
    return null
}


export function allChildrenAreFixedHorizontal(children) {
    let fixedChildren = children.filter(f => {
        return f.props && f.props.resize && f.props.resize.fixedHorizontal
    })
    return fixedChildren.length === children.length
}



export function getImages (app) {
    let images = []
    let urls = {}
    Object.values(app.widgets).forEach(w => {
        if (w.style && w.style.backgroundImage) {
            let backgroundImage = w.style.backgroundImage
            let url = getImageLocation(w, backgroundImage.url)
            if (!urls[url]) {
                images.push({
                    name: url,
                    type: 'images',
                    id: w.id,
                    src: backgroundImage.url,
                })
                urls[url] = true
            }
        }
    })
    Object.values(app.screens).forEach(w => {
        if (w.style && w.style.backgroundImage) {
            let backgroundImage = w.style.backgroundImage
            let url = getImageLocation(w, backgroundImage.url)
            if (!urls[url]) {
                images.push({
                    name: url,
                    type: 'images',
                    id: w.id,
                    src: backgroundImage.url,
                })
                urls[url] = true
            }
        }
    })
    return images
}

export function getImageLocation(w, url) {
    let parts = url.split('/')
    if (parts.length === 2) {
        return parts[1]
    }
    return url
}

export function removeCommonPath (a, b) {
    let path = []
    let aParts = a.split('/')
    let bParts = b.split('/')
    let different = false
    aParts.forEach((p, i) => {
        if (p !== bParts[i] || different) {
            path.push(p)
            different = true
        }
    })
    return path.join('/')
}




/**
 * Generates the css for a given screen. Includes the styles for the screen and all
 * its children. Certain elements, like common, might be excluded.
 *
 * @param {*} screen The screen to genearte for
 * @param {*} code The code object with the styles
 * @param {*} exclude An array of types to be exluded, e.g ['template']
 */
export function getScreenCSS (screen, code, exclude) {
    let css = ''
    let normalize = code.styles['$NORMALIZE']
    if (normalize) {
        css += normalize.map(s => s.code).join('\n')
    }
    css += screen.styles.map(s => s.code).join('\n')
    let elements = getAllChildrenForScreen(screen)
    let written = []
    elements.forEach(element => {
        let styles = code.styles[element.id]
        if (exclude) {
            styles = styles.filter(s => exclude.indexOf(s.type) < 0)
        }
        styles.forEach(s => {
            if (!written[s.css]) {
                css += s.code + '\n'
                written[s.css] = true
            }
        })
        // css += styles.map(s => s.code).join('\n')
    })
    return css
}

export function getAllChildrenForScreen(screen) {
    const result = []
    if (screen.model.children) {
        screen.model.children.forEach(child => {
            result.push(child)
            getAllChildren(child, result)
        });
    }
    if (screen.model.fixedChildren){
        screen.model.fixedChildren.forEach(child => {
            result.push(child)
        })
    }
    return result
}

export function fixAutos (style, widget) {
    if (style.fontSize === 'Auto') {
        style.fontSize = widget.h
    }
    return style
}

/**
 * FIX for old models without z-value
 */
function fixMissingZValue (box) {
    if (box.z === null || box.z === undefined) {
        box.z = 0;
    }
}

/**
 * Get children
 */
export function getOrderedWidgets (widgets) {
    var result = [];
    for (var id in widgets) {
        var widget = widgets[id];
        if (widget) {
            fixMissingZValue(widget);
            result.push(widget);
        }
    }
    sortWidgetList(result);
    return result;
}


/**
 * This method is super important for the correct rendering!
 *
 * We sort by:
 *
 *  1) style.fixed: fixed elements will be renderd last, therefore they come
 *  as the last elements in the list
 *
 * 	2) inherited : inherited values come first. They shall be rendered below the
 *  widget of the new screen
 *
 *  3) z : High z values come later
 *
 *  4) id: if the z value is the same, sort by id, which means the order the widgets have been
 *  added to the screen.
 */
export function sortWidgetList (result) {
    /**
     * Inline function to determine if a widget is fixed.
     * we have to check if style exists, because the Toolbar.onToolWidgetLayer()
     * call the method without styles.
     */
    var isFixed = function(w) {
        if (w.style && w.style.fixed) {
        return true;
        }
        return false;
    };

    result.sort(function(a, b) {
        var aFix = isFixed(a);
        var bFix = isFixed(b);

        /**
         * 1) Sort by fixed. If both are fixed or not fixed,
         * continue sorting by inherited.
         */
        if (aFix == bFix) {
        /**
         * If both a inherited or not inherited,
         * continue sorting by z & id
         */
        if ((a.inherited && b.inherited) || (!a.inherited && !b.inherited)) {
            /**
             * 4) if the have the same z, sot by id
             */
            if (a.z == b.z && (a.id && b.id)) {
            return a.id.localeCompare(b.id);
            }

            /**
             * 3) Sort by z. Attention, Chrome
             * needs -1, 0, 1 or one. > does not work
             */
            return a.z - b.z;
        }
        if (a.inherited) {
            return -1;
        }

        return 1;
        }
        if (aFix) {
        return 1;
        }
        return -1;
    });
}

export function getAllChildren(node, result){
    if (node.children) {
       node.children.forEach(child => {
            result.push(child)
            getAllChildren(child, result)
        });
    }
}

export function isContainedInBox (obj, parent) {
    if (parent) {
        if (
            obj.x >= parent.x &&
            obj.x + obj.w <= parent.w + parent.x &&
            (obj.y >= parent.y && obj.y + obj.h <= parent.y + parent.h)
            ) {
            return true;
        }
    }
    return false;
}

export function getBoundingBoxByIds (ids, model) {
    let children = ids.map(id => {
        if (model.widgets && model.widgets[id]) {
            return model.widgets[id]
        } else {
            Logger.log(1, 'ExportUtil.getBoundingBoxByIds() > No child with id', id)
        }
        return null
    }).filter(child => child !== null)
    return getBoundingBoxByBoxes(children)
}

export function getBoundingBoxByBoxes (boxes) {
    var result = { x: 100000000, y: 100000000, w: 0, h: 0 };

    for (var i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        result.x = Math.min(result.x, box.x);
        result.y = Math.min(result.y, box.y);
        result.w = Math.max(result.w, box.x + box.w);
        result.h = Math.max(result.h, box.y + box.h);
    }

    result.h -= result.y;
    result.w -= result.x;

    return result;
}


export function createInheritedModel(model) {
    /**
     * Build lookup map for overwrites
     */
    var overwritenWidgets = {};
    for (let screenID in model.screens) {
        let screen = model.screens[screenID];
        overwritenWidgets[screenID] = {};
        for (let i = 0; i < screen.children.length; i++) {
            let widgetID = screen.children[i];
            let widget = model.widgets[widgetID];
            if (widget && widget.parentWidget) {
                overwritenWidgets[screenID][widget.parentWidget] = widgetID;
            }
        }
    }


    var inModel = clone(model);
    inModel.inherited = true;

    /**
     * add container widgets
     */
    createContaineredModel(inModel)

    /**
     * add widgets from parent (master) screens
     */
    for (let screenID in inModel.screens) {
        /**
         * *ATTENTION* We read from the org model, otherwise we have
         * issues in the loop as we change the screen.
         */
        let screen = model.screens[screenID];
        if (screen.parents && screen.parents.length > 0) {
            /**
             * add widgets from parent screens
             */
            for (let i = 0; i < screen.parents.length; i++) {
                let parentID = screen.parents[i];
                if (parentID != screenID) {
                    if (model.screens[parentID]) {
                        /**
                         * *ATTENTION* We read from the org model, otherwise we have
                         * issues in the loop as we change the screen!
                         */
                        let parentScreen = model.screens[parentID];

                        let difX = parentScreen.x - screen.x;
                        let difY = parentScreen.y - screen.y;

                        let parentChildren = parentScreen.children;
                        for (var j = 0; j < parentChildren.length; j++) {
                            let parentWidgetID = parentChildren[j];

                            /**
                             * *ATTENTION* We read from the org model, otherwise we have
                             * issues in the loop as we change the screen!
                             */
                            let parentWidget = model.widgets[parentWidgetID];
                            if (parentWidget) {
                                let overwritenWidgetID = overwritenWidgets[screenID][parentWidgetID];
                                if (!overwritenWidgetID) {
                                    let copy = clone(parentWidget);

                                    /**
                                     * Super important the ID mapping!!
                                     */
                                    copy.id = parentWidget.id + "@" + screenID;
                                    copy.inherited = parentWidget.id;
                                    copy.inheritedScreen = screenID;
                                    copy.inheritedOrder = i + 1;

                                    /**
                                     * Now lets also put it at the right position!
                                     */
                                    copy.x -= difX;
                                    copy.y -= difY;

                                    /**
                                     * We write the new widget to the inherited model!
                                     *
                                     */
                                    inModel.widgets[copy.id] = copy;
                                    inModel.screens[screenID].children.push(copy.id);

                                    /**
                                     * Also add a to the inherited copies
                                     * so we can to live updates in canvas
                                     */
                                    let parentCopy = inModel.widgets[parentWidget.id];
                                    if (!parentCopy.copies) {
                                        parentCopy.copies = [];
                                    }
                                    parentCopy.copies.push(copy.id);
                                } else {
                                    let overwritenWidget = inModel.widgets[overwritenWidgetID];

                                    if (overwritenWidget) {
                                        overwritenWidget.props = mixin(clone(parentWidget.props),overwritenWidget.props,true);
                                        overwritenWidget.style = mixin(clone(parentWidget.style),overwritenWidget.style,true);
                                        if (overwritenWidget.hover) {
                                            overwritenWidget.hover = mixin(clone(parentWidget.hover),overwritenWidget.hover,true);
                                        }
                                        if (overwritenWidget.error) {
                                            overwritenWidget.error = mixin(clone(parentWidget.error), overwritenWidget.error, true);
                                        }

                                        /**
                                         * Also add a reference to the *INHERITED* copies
                                         * so we can to live updates in canvas
                                         */
                                        let parentCopy = inModel.widgets[parentWidget.id];
                                        if (!parentCopy.inheritedCopies) {
                                            parentCopy.inheritedCopies = [];
                                        }
                                        parentCopy.inheritedCopies.push(overwritenWidget.id);

                                        /**
                                         * Also inherited positions
                                         */
                                        if (overwritenWidget.parentWidgetPos) {
                                            overwritenWidget.x = parentWidget.x - difX;
                                            overwritenWidget.y = parentWidget.y - difY;
                                            overwritenWidget.w = parentWidget.w;
                                            overwritenWidget.h = parentWidget.h;
                                        }
                                        overwritenWidget._inheried = true;
                                    } else {
                                        console.error("createInheritedModel() > No overwriten widget in model");
                                    }
                                }
                            } else {
                                console.warn("createInheritedModel() > no parent screen child with id > " + parentID + ">" + parentWidget);
                            }
                        }
                    } else {
                        console.warn("createInheritedModel() > Deteced Self inheritance...", screen);
                    }
                } else {
                    console.warn("createInheritedModel() > no parent screen with id > " + parentID);
                }
            }
        }
    }
    return inModel;
}

export function createContaineredModel(inModel) {
    for (let screenID in inModel.screens) {
        let screen = inModel.screens[screenID];
        for (let i = 0; i < screen.children.length; i++) {
            let widgetID = screen.children[i];
            let widget = inModel.widgets[widgetID];
            if (widget) {
                if (widget.isContainer){
                    let children = getContainedChildWidgets(widget, inModel)
                    widget.children = children.map(w => w.id)
                }
            } else {
                /**
                 * FIXME: This can happen for screen copies...
                 */
                // console.warn('Core.createContaineredModel() > cannot find widgte', widgetID)
            }
        }
    }
}

export function inlineTemplateStyles (model) {
    for (let widgetID in model.widgets){
        let widget = model.widgets[widgetID]
        if (widget.template) {
            /**
             * FIXME: What about style?
             */
            let hover = this.getTemplatedStyle(widget, model, 'hover')
            if (hover) {
                widget.hover = hover
            }
            let error = this.getTemplatedStyle(widget, model, 'error')
            if (error) {
                widget.error = error
            }
            let focus = this.getTemplatedStyle(widget, model, 'focus')
            if (focus) {
                widget.focus = focus
            }
            let active = this.getTemplatedStyle(widget, model, 'active')
            if (active) {
                widget.active = active
            }
        }
        
    }
    return model
}

export function getTemplatedStyle(widget, model, prop) {
    if (widget.template) {
        if (model.templates) {
            var t = model.templates[widget.template];
            if (t && t[prop]) {
                /**
                 * Merge in overwriten styles
                 */
                var merged = clone(t[prop])
                if (widget[prop]) {
                    let props = widget[prop]
                    for (var key in props) {
                        merged[key] = props[key]
                    }
                }
                return merged;
            }
        }
    }
    return widget[prop];
}


function getContainedChildWidgets (container, model) {
    let result = []
    /*
     * Loop over sorted list
     */
    let sortedWidgets = getOrderedWidgets(model.widgets)
    let found = false
    for (let i = 0; i < sortedWidgets.length; i++){
        let widget = sortedWidgets[i]
         if (container.id != widget.id) {
            if (found && isContainedInBox(widget, container)){
                widget.container = container.id
                result.push(widget)
            }
        } else {
            found = true
        }
    }
    return result;
}

export function addContainerChildrenToModel (model) {
    /**
     * Add here some function to add the virtual children, so that stuff
     * works also in the analytic canvas. This would mean we would have to
     * copy all the code from the Repeater to here...
     */
    return model
}


export function mixin(a, b, keepTrack) {
    if (a && b) {
        b = clone(b);
        if (keepTrack) {
            b._mixed = {};
        }

        for (var k in a) {
            if (b[k] === undefined || b[k] === null) {
                b[k] = a[k];
                if (keepTrack) {
                    b._mixed[k] = true;
                }
            }
        }
    }
    return b;
}

export function mixinNotOverwriten(a, b) {
    if (a && b) {
        var mixed = {};
        if (b._mixed) {
            mixed = b._mixed;
        }
        //console.debug("mixinNotOverwriten", overwriten)
        for (var k in a) {
            if (b[k] === undefined || b[k] === null || mixed[k]) {
                b[k] = a[k];
            }
        }
    }
    return b;
}

export function clone (obj) {
    if (!obj) {
        return null
    }
    let _s = JSON.stringify(obj)
    return JSON.parse(_s)
}


export function getLines (widget, model) {
    var result = [];

    if(widget.inherited && model.widgets[widget.inherited]){
        widget = model.widgets[widget.inherited];
    }
    
    var widgetID = widget.id;
    var lines = getFromLines(widget, model);
    if(lines && lines.length > 0){
        return lines;
    }
    
    var group = getParentGroup(widgetID, model);
    if(group){
        var groupLine = getFromLines(group, model);
        if(groupLine && groupLine.length > 0){
            return groupLine;
        }
    }

    /**
     * Since 2.1.3 we use might have sub groups.
     */
    var topGroup = getTopParentGroup(widgetID, model);
    if(topGroup){
        let groupLine = getFromLines(topGroup, model);
        if(groupLine && groupLine.length > 0){
            return groupLine;
        }
    }

    return result;
}

export function getTopParentGroup (id, model) {
    let group = getParentGroup(id, model)
    if (group) {
        while (group) {
            let parent = getParentGroup(group.id, model)
            if (parent) {
                group = parent
            } else {
                /**
                 * In contrast the the Layout copz of this, we do not add
                 * all children... not sure it this is needed
                 */
                return group
            }
        }
    }
    return null
}

function getParentGroup (widgetID, model) {
    if (model.groups) {
        for (var id in model.groups) {
            var group = model.groups[id];
            var i = group.children.indexOf(widgetID);
            if (i > -1) {
                return group;
            }
            /**
             * Since 2.13 we have subgroups and check this too
             */
            if (group.groups) {
                let i = group.groups.indexOf(widgetID);
                if (i > -1) {
                    return group;
                }
            }
        }
    }
    return null;
}



function getFromLines (box, model) {
    var result = [];
    for (var id in model.lines) {
        var line = model.lines[id];
        if (line.from == box.id) {
            result.push(line);
        }
    }
    return result;
}

export function getBoxById (id, model) {
    if (model.screens[id]) {
        return model.screens[id]
    }
    if (model.widgets[id]) {
        return model.widgets[id]
    }
}
