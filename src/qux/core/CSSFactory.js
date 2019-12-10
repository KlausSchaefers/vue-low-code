
import * as Util from './ExportUtil'
import Logger from './Logger'
export default class {

	constructor (config = {}) {
		Logger.log(1, 'CSSFactory.constructor() ', config)
		this.marginWhiteSpaceCorrect = 0;
		this.gridAutoErrorThreshold = 5
		if (config.css) {
			this.isGrid = config.css.grid
			this.justifyContentInWrapper = config.css.justifyContentInWrapper
			this.prefix = config.css.prefix ? config.css.prefix : ''
			this.gridAutoErrorThreshold = config.css.gridAutoErrorThreshold ? config.css.gridAutoErrorThreshold : 5
		}
	

		this.mapping = {
			"background" : "background-color",

			"color" : "color",
			"textAlign" : "text-align",
			"fontFamily" : "font-family",
			"fontSize" : "font-size",
			"fontStyle" : "font-style",
			"fontWeight" : "font-weight",
			"letterSpacing" : "letter-spacing",
			"lineHeight" : "line-height",

			"border": "border",
			"borderWidth": "border-width",
			"borderStyle": "border-style",
			"borderColor": "border-color",
			"borderRadius": "border-radius",
			"borderLeft": "border-left",
			"borderRight": "border-right",
			"borderTop": "border-top",
			"borderBottom": "border-bottom",

			"borderBottomColor" : "border-bottom-color",
			"borderTopColor" : "border-top-color",
			"borderLeftColor" : "border-left-color",
			"borderRightColor" : "border-right-color",

			"borderBottomLeftRadius" : "border-bottom-left-radius",
			"borderTopLeftRadius" : "border-top-left-radius",
			"borderBottomRightRadius" : "border-bottom-right-radius",
			"borderTopRightRadius" : "border-top-right-radius",

			"borderBottomWidth" : "border-bottom-width",
			"borderTopWidth" : "border-top-width",
			"borderLeftWidth" : "border-left-width",
			"borderRightWidth" : "border-right-width",

			"borderTopStyle" : "border-top-style",
			"borderBottomStyle" : "border-bottom-style",
			"borderRightStyle" : "border-left-style",
			"borderLeftStyle" : "border-right-style",

			"paddingBottom" : "padding-bottom",
			"paddingLeft" : "padding-left",
			"paddingRight" : "padding-right",
			"paddingTop" : "padding-top",
			"padding": "padding",

			//"marginBottom" : "margin-bottom",
			//"marginLeft" : "margin-left",
			//"marginRight" : "margin-right",
			//"marginTop": "margin-top",

			"textDecoration" : "text-decoration",
			"boxShadow" : "box-shadow",
			"textShadow" : "text-shadow"
		}

		this.borderWidthProperties = ['borderBottomWidth', 'borderTopWidth', 'borderLeftWidth', 'borderRightWidth']
		this.borderStyleProperties = ['borderTopStyle', 'borderBottomStyle', 'borderRightStyle', 'borderLeftStyle']
		this.textProperties = [
			'color', 'textDecoration', 'textAlign', 'fontFamily',
			'fontSize', 'fontStyle', 'fontWeight', 'letterSpacing', 'lineHeight'
		]

		this.isPixel = {
			"borderBottomLeftRadius": true,
			"borderBottomRightRadius": true,
			"borderTopRightRadius": true,
			"borderTopLeftRadius": true,

			"borderBottomWidth": true,
			"borderLeftWidth": true,
			"borderTopWidth": true,
			"borderRightWidth": true,

			"paddingBottom": true,
			"paddingLeft": true,
			"paddingRight": true,
			"paddingTop": true,

			"fontSize": true
		}

		this.heightProperties = [
			'paddingTop', 
			'_paddingTop', 
			'paddingBottom', 
			'_paddingBottom', 
			'borderTopWidth', 
			'_borderTopWidth',
			'borderBottomWidth',
			'_borderBottomWidth'
		]
	}

	generate(model) {
		let result = {}

		/**
		 * Generate the template styles
		 */
		model.templates.forEach(t => {
			let style = {
				type: 'template',
				css: t.cssSelector,
				global:true,
				code: this.getCSS(t, null, false)
			}
			result[t.id] = [style]
		})

		/**
		 * Generate styles for each screen. The templates styles
		 * might here be reused!
		 */
		model.screens.forEach(screen => {
			result[screen.id] = []
			result[screen.id].push({
				type: 'screen',
				css: screen.cssSelector,
				global:false,
				code: this.getCSS(screen)
			})
			screen.children.forEach(child => {
				this.generateElement(child, result, screen)
			})
			
			screen.fixedChildren.forEach(child => {
				this.generateElement(child, result, screen)
			})
		})

		/**
		 * Add some normalizer styles
		 */
		result['$NORMALIZE'] = []
		result['$NORMALIZE'].push({
			type: 'screen',
			css: '',
			global:true,
			code: this.getGlobalStyles()
		})

		return result
	}



	getGlobalStyles () {
		let result = ''
		result += `body {\n  margin:0px;\n  font-family:'Source Sans Pro', 'Helvetica Neue', 'Helvetica', sans-serif;\n}\n\n`
		result += `div {\n  margin:0px;\n}\n\n`
		return result
	}

	generateElement (node, result, screen) {

		result[node.id] = []

		/**
		 * If we have a templated node,
		 * add also the template class here
		 */
		if (node.template) {
			let template = result[node.template]
			if (template) {
				template.forEach(t => {
					result[node.id].push(t)
				})
			}
		}

		/**
		 * TDOD: If we have shared code...
		 */
		result[node.id].push({
			type: 'widget',
			css: node.cssSelector,
			global:false,
			code: this.getCSS(node, screen),
			inherited: node.inherited,
			inheritedScreen: node.inheritedScreen
		})


		if (node.children) {
			node.children.forEach(child =>{
				this.generateElement(child, result, screen)
			})
		}
	}


	getRaw (model, selectedWidgets) {
		var result = "";
		for (var i=0; i< selectedWidgets.length; i++) {
			var id = selectedWidgets[i];
			var widget = model.widgets[id];
			if (widget) {
				result += this.getCSS(widget, null, false)
			} else {
				this.logger.warn("getRaw", "No widget with id > " + widget);
			}
		}
		return result;
	}

	getSelector(widget) {
		return widget.cssSelector
	}

	getName(box){
		let name = box.name.replace(/\s+/g, '_')
		if (box.inherited) {
			name += '_Master'
		}
		if (this.prefix) {
			name = `${this.prefix}_${name}`
		}
		return name
	}

	getCSS (widget, screen, position = true) {
		var result = "";

		var style = widget.style;
		style = Util.fixAutos(style, widget)

		let selector = this.getSelector(widget, screen);
		result += selector + ' {\n'
		result += this.getRawStyle(style);

		if (position) {
			result += this.getPosition(widget, screen);
		}
		if (this['getCSS_' + widget.type]) {
			result += this['getCSS_' + widget.type](widget.style, widget, selector)
		}
		result += '}\n\n'
	
		if (widget.hover) {
			result += selector + ':hover {\n'
			result += this.getRawStyle(widget.hover);
			result += '}\n\n'
		}

		if (widget.focus) {
			result += selector + ':focus {\n'
			result += this.getRawStyle(widget.focus);
			result += '}\n\n'
		}

		if (widget.error) {
			result += selector + ':invalid {\n'
			result += this.getRawStyle(widget.error);
			result += '}\n\n'
		}

		
		return result
	}

	getCSS_XRepeater(style, widget) {
		let result = ''
		result += `  font-size:${widget.h}px;\n`
		return result
	}

	getCSS_Icon(style, widget) {
		let result = ''
		result += `  font-size:${widget.h}px;\n`
		return result
	}

	getCSS_Image() {
		let result = ''
		if (this.isGrid) {
			result += `  height:100%;\n`
			result += `  width:100%;\n`
		}
		return result
	}

	getPosition (widget) {
		if (widget.style.fixed) {
			return this.getFixedPosition(widget)
		} else if (Util.hasWrappedParent(widget)) {
			return this.getWrappedPosition(widget)
		} else if (!this.isGrid) {
			return this.getFlexPosition(widget)
		} else {
			return this.getGridPosition(widget)
		}
	}

	getWrappedPosition (widget) {
		Logger.log(5, 'CSSFactory.getWrappedPosition()' + widget.name, widget.props.resize)
		let result = ''
		result += `  min-height: ${this.getWrappedHeight(widget)};\n`
		result += `  width: ${this.getWrappedWidth(widget)};\n`
		// result += `  flex-grow: 1;\n`
		// if we 
		// result += `  margin-right: ${widget.right}px;\n`
		result += `  margin: ${widget.wrapOffSetY}px ${widget.wrapOffSetX}px;\n`
		return result
	}

	getWrappedEnd (selector, widget) {
		let result = ''
		if (Util.isWrappedContainer(widget)) {
			result += selector + ':after {\n'
			result += `  content:'';\n`
			result += `  flex:auto;\n`
			result += '}\n\n'
		}
		return result
	}

	getWrappedMargin () {
		return '10px';
	}

	getWrappedHeight (widget) {
		return this.getCorrectedHeight(widget);
	}

	getWrappedWidth (widget) {
		if (Util.isFixedHorizontal(widget)){
			return this.getFixedWidth(widget);
		} else {
			return this.getResponsiveWidth(widget)
		}
	}

	getFlexPosition (widget) {
		Logger.log(5, 'CSSFactory.getFlexPosition()' + widget.name, widget.props.resize)
		let result = ''

		if (Util.isWrappedContainer(widget)) {
			result += '  display: flex;\n'
			result += '  flex-direction: row;\n'
			result += '  flex-wrap: wrap;\n'
			result += '  align-items: flex-start;\n'
			if (this.justifyContentInWrapper) {
				result += '  justify-content: space-between;\n'
			}
		} else if (widget.isRow) {
			result += '  display: flex;\n'
			result += '  flex-direction: row;\n'
			result += '  justify-content: space-between;\n'
		} else if (widget.isColumn) {
			result += ' display: flex;\n'
			result += '  flex-direction: column;\n'
		} else if (widget.children.length > 0) {
			result += '  display: flex;\n'
			result += '  flex-direction: column;\n'
		}

		if (widget.parent) {
			result += this.setFlexY(widget, result)
			result += this.setFlexX(widget, result)
			if (Util.isLastChild(widget) && !Util.isRepeater(widget.parent)){
				result += `  margin-bottom: ${this.getFlexBottom(widget)};\n`
			}
		}
		return result
	}

	setFlexY (widget, result) {
		Logger.log(5, 'CSSFactory.setFlexY() ' + widget.name, Util.isFixedVertical(widget))
		result += `  margin-top: ${this.getFlexTop(widget)};\n`
		/**
		 * FixedHeigth if set, or if widget.parent.isWrap
		 */
		if (!Util.isWrappedContainer(widget)) {
			if (Util.isFixedVertical(widget) && Util.hasNoChildren(widget) 
				|| this.hasAllwaysFixedHeight(widget) 
				|| Util.isWrappedContainer(widget.parent)){
				result += `  height: ${this.getFlexHeight(widget)};\n`
			} else {
				result += `  min-height: ${this.getFlexHeight(widget)};\n`
			}
		}
		return result
	}

	setFlexX (widget, result) {
		Logger.log(5, 'CSSFactory.setFlexX() ' + widget.name, Util.isPinnedLeft(widget))
		
		if (Util.isPinnedLeft(widget) && Util.isPinnedRight(widget)) {
			Logger.log(5, 'CSSFactory.setFlexX() > left & right: ' + widget.name)

			/**
			 * FIXME: This is sooo complex. we should somhow chekc some more stuff
			 * if pinned left and right, we just set the margins and let the width be auto
			 */
			result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
			if (widget.parent.isRow ){
				if (!widget.canGrow) {
					result += `  width: ${this.getFixedWidth(widget)};\n`	
				} else {
					result += `  flex-grow: 1;\n`
				}
			} else {
				result += `  margin-right: ${this.getPinnedRight(widget)};\n`
			}
			// result += `  width: 100%;\n`
		} else {
			result += `  width: ${this.getFlexWidth(widget)};\n`
			/**
			 * If pinned right and we are in a row (space-between) we
			 * just add relative left margin. If we are alone in a row,
			 * add the calculated left margin. 
			 */
			if (Util.isPinnedRight(widget)) {
				Logger.log(1, 'CSSFactory.setFlexX() > right: ' + widget.name)
				result += `  margin-right: ${this.getPinnedRight(widget)};\n`
				if (Util.isSingleChildInRow(widget)) {
					result += `  margin-left: ${this.getCalcLeft(widget)};\n`
				} else {
					result += `  margin-left: ${this.getResponsiveLeft(widget)};\n`
				}
			} else if (Util.isPinnedLeft(widget)){
				result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
				if (!Util.isFixedHorizontal(widget)) {
					result += `  flex-grow: 1;\n`
				}
			} else {
				result += `  margin-left: ${this.getResponsiveLeft(widget)};\n`
			}
		}
		return result
	}
	
	getFlexHeight (widget) {
		return this.getCorrectedHeight(widget);
	}

	getFlexTop (widget) {
		return widget.y + 'px'
	}

	getFlexBottom (widget) {
		return this.getPinnedBottom(widget)
	}

	getFlexWidth (widget) {
		if (Util.isFixedHorizontal(widget)){
			return this.getFixedWidth(widget);
		} else {
			return this.getResponsiveWidth(widget)
		}
	}

	getFixedPosition (widget) {
		let result = '  position: fixed;\n';
		if (Util.isFixedHorizontal(widget)){
			result += `  width: ${this.getFixedWidth(widget)};\n`
		} else {
			result += `  width: ${this.getResponsiveWidth(widget)};\n`
		}
		if (Util.isPinnedLeft(widget)) {
			result += `  left: ${this.getPinnedLeft(widget)};\n`
		} else if (Util.isPinnedRight(widget)) {
			result += `  right: ${this.getPinnedRight(widget)};\n`
		} else {
			result += `  left: ${this.getResponsiveLeft(widget)};\n`
		}
		result += `  top: ${widget.y}px;\n`
		result += `  height: ${this.getCorrectedHeight(widget)};\n`
		return result
	}

	getGridPosition (widget) {
		Logger.log(3, 'CSSFactory.getGridPosition() > ' + widget.name, widget.grid) 
		let result = ''
	
		if (widget.grid) {
			// FIXME: Remove the false!
			if (Util.isRowGrid(widget)) {
				widget.grid.isRow = true
				result += `  display: flex;\n`
				result += `  flex-direction: column;\n`
			} else {
				result += '  display: grid;\n'
				result += '  grid-template-columns: ' + this.getGridTracks(widget.w, widget.grid.columns, widget) + ';\n'
				result += '  grid-template-rows: ' + this.getGridTracks(widget.h, widget.grid.rows, widget) + ';\n'
			}
		}

		if (widget.parent) {
			// console.debug(widget.name, widget.parent.name, widget.parent.grid !== undefined)
			if (widget.parent.grid && widget.parent.grid.isRow) {	
				//FIXME: Here we should have some where fancz logic to take pins and fix into account
				if (Util.isPinnedLeft(widget) && Util.isPinnedRight(widget)) {
					result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
					result += `  margin-right: ${this.getPinnedRight(widget)};\n`
				} else if (Util.isPinnedLeft(widget)){
					if (Util.isFixedHorizontal(widget)){
						result += `  width: ${this.getFixedWidth(widget)};\n`
						result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
					} else {
						result += `  margin-right: ${this.getResponsiveRight(widget)};\n`
						result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
					}
					
				} else if (Util.isPinnedRight(widget)){
					if (Util.isFixedHorizontal(widget)){
						result += `  width: ${this.getFixedWidth(widget)};\n`
						result += `  margin-left: ${this.getCalcLeft(widget)};\n`
					} else {
						result += `  margin-left: ${this.getResponsiveLeft(widget)};\n`
						result += `  margin-right: ${this.getPinnedRight(widget)};\n`
					}
				} else {
					if (Util.isFixedHorizontal(widget)){
						result += `  width: ${this.getFixedWidth(widget)};\n`
						result += `  margin-left: ${this.getResponsiveLeft(widget)};\n`
					} else {
						result += `  margin-right: ${this.getResponsiveRight(widget)};\n`
						result += `  margin-left: ${this.getResponsiveLeft(widget)};\n`
					}
				}
				if (Util.isFixedVertical(widget)){
					result += `  height: ${this.getCorrectedHeight(widget)};\n`
				} else {
					result += `  min-height: ${this.getCorrectedHeight(widget)};\n`
				}				
				result += `  margin-top: ${this.getPinnedTop(widget)};\n`

	
				if (Util.isLastChild(widget) && !Util.isRepeater(widget.parent)){
					result += `  margin-bottom: ${this.getPinnedBottom(widget)};\n`
				}
			} else {
				result += `  grid-column-start: ${widget.gridColumnStart + 1};\n`
				result += `  grid-column-end: ${widget.gridColumnEnd + 1};\n`
				result += `  grid-row-start: ${widget.gridRowStart + 1};\n`
				result += `  grid-row-end: ${widget.gridRowEnd + 1};\n`
			}
		} else {
			result += `  min-height: 100%;\n`
		}
		return result
	}

	getPinnedBottom (widget) {
		if(widget.parent){
			let parent = widget.parent
			let innerHeight = parent.children.map(c => {
				// grid has top
				if (c.top != undefined) {
					return c.h + c.top
				}
				return c.h + c.y
			}).reduce((a, b) => a + b, 0)
			return Math.max(0, parent.h - innerHeight) + 'px'
		}
		return 'auto'
	}

	getFixedWidth (widget) {
		return widget.w + 'px'
	}

	getFixedTop (widget) {
		return widget.y + 'px'
	}

	getPinnedTop (widget) {
		return widget.top + 'px'
	}

	getCalcLeft (widget) {
		if (widget.parent) {
			let right = (widget.parent.w - (widget.x + widget.w))
			return `calc(100% - ${widget.w + right}px)`
		}
		return '0px';
	}

	getResponsiveLeft (widget) {
		if (widget.parent) {
			return Math.round(widget.x * 100 / widget.parent.w) + '%'
		}
		return widget.x + 'px'
	}

	getResponsiveRight (widget) {
		if (widget.parent) {
			let right = (widget.parent.w - (widget.x + widget.w)) 
			return Math.round(right * 100 / widget.parent.w) + '%'
		}
		return widget.x + 'px'
	}

	getPinnedLeft (widget) {
		return widget.x + 'px'
	}

	getPinnedRight (widget) {
		if (widget.parent) {
			if (widget.absX) {
				return (widget.parent.w - (widget.absX + widget.w)) + 'px'
			} else {
				return (widget.parent.w - (widget.x + widget.w)) + 'px'
			}
		}
		return '0px'; 
	}

	getResponsiveWidth( widget) {
		if (widget.parent) {
			/**
			 * What about border...
			 */
			return Math.round(widget.w * 100 / widget.parent.w) + '%'
		}
		return  '100%'
	}

	getFixedHeight (widget) {
		return widget.h + 'px'
	}

	getCorrectedHeight (widget) {
		let h = widget.h
		this.heightProperties.forEach(key => {
			if (widget.style[key]) {
				h -= widget.style[key]
			}
		})
		return h + 'px'
	}


	getGridTracks (total, list, widget) {
		Logger.log(6, 'CSSFactory.getGridTracks() > ' + widget.name, list)
		if (list) {
			let max = Math.max(...list.map(i => i.l))
			return list.map(i => {
				if (i.fixed) {
					return i.l + 'px'
				}
				/**
				 * We might want several autos. This is very sensitive
				 * to small changes in the editor. Therefore we give a 
				 * small error marginf
				 */
				if (Math.abs(max - i.l) <= this.gridAutoErrorThreshold) { // max === i.l
					return 'auto'
				}
				return Math.round(i.l * 100 / total) + '%'
			}).join(' ') 
		}
	}

	getAbsolutePosition (widget) {
		let result = ''

		/**
		 * If the widget is on the root level, we use teh screen!
		 */
		let w = widget.w
		let h = widget.h
		let top = widget.y
		let left = Math.max(0, widget.x - this.marginWhiteSpaceCorrect)
		let unitX = 'px'
		let unitY = 'px'

		/**
		 * Take padding and border into account into account
		 */
		if (widget.style) {
			if (widget.style.paddingTop) {
				h -= widget.style.paddingTop
			}
			if (widget.style.paddingBottom) {
				h -= widget.style.paddingBottom
			}
			if (widget.style.paddingLeft) {
				w -= widget.style.paddingLeft
			}
			if (widget.style.paddingRight) {
				w -= widget.style.paddingRight
			}

			if (widget.style.borderTopWidth) {
				h -= widget.style.borderTopWidth
			}
			if (widget.style.borderBottomWidth) {
				h -= widget.style.borderBottomWidth
			}
			if (widget.style.borderLeftWidth) {
				w -= widget.style.borderLeftWidth
			}
			if (widget.style.borderRightWidth) {
				w -= widget.style.borderRightWidth
			}
		}

	
		/**
		 * To deal with margin collapsing we set things to inline-block. We could
		 * still check for borders...
		 */
		if (this.getSiblings(widget).length > 1) {
			result += '  display: inline-block;\n'
		}
		
		result += `  width: ${w}px;\n`
		result += `  height: ${h}${unitY};\n`
		result += `  margin-top: ${top}${unitY};\n`
		result += `  margin-left: ${left}${unitX};\n`

		return result
	}

	getSiblings (widget){
		if (widget.parent && widget.parent.children){
			return widget.parent && widget.parent.children
		}
		return []
	}

	getRawStyle (style) {
		var result = ''
		for (var key in this.mapping) {
			if (style[key] !== undefined && style[key] !== null) {
				var value = style[key];
				result += '  ' + this.getKey(key) + ': ' + this.getValue(key, value) + ';\n'
			}
		}
		return result;
	}

	getKey (key) {
		return this.mapping[key];
	}

	getValue (key, value) {
		var result = ''
		if (key === 'fontFamily'){
			result += this.escapeFontFamily(value)
		} else if (this.isPixel[key]) {
			result += value + 'px';
		} else if (key === "boxShadow") {
			result = value.h+"px "+ value.v+"px "+ value.b+"px "+ value.s + "px " + value.c;
			if (value.i) {
				result += 'inset'
			}
		} else if (key === 'textShadow') {
			result = value.h+"px "+ value.v+"px "+ value.b+"px "+ value.c;
		} else {
			result += value
		}
		return result;
	}

	escapeFontFamily (value) {
		return value.split(',').map(f => {
			if (f.indexOf(' ') >= 0) {
				return '"' + f + '"';
			}
			return f
		}).join(', ')
	}

	clone (obj) {
        if (!obj) {
            return null
        }
        let _s = JSON.stringify(obj)
        return JSON.parse(_s)
	}
	
	hasAllwaysFixedHeight (widget) {
		return widget.type === 'Icon'
	}
}