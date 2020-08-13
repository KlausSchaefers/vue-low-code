
import * as Util from './ExportUtil'
import * as Color from './ColorUtil'
import CSSWidgetFactory from '../web/css/CSSWidgetFactory'
import Logger from './Logger'
export default class CSSFactory {

	constructor (config = {}, imagePrefix='') {
		Logger.log(4, 'CSSFactory.constructor() ', config)
		this.marginWhiteSpaceCorrect = 0
		this.gridAutoErrorThreshold = 5
		this.imagePrefix = imagePrefix
		if (config.css) {
			this.isForceGrid = config.css.grid
			this.justifyContentInWrapper = config.css.justifyContentInWrapper
			this.prefix = config.css.prefix ? config.css.prefix : ''
			this.gridAutoErrorThreshold = config.css.gridAutoErrorThreshold ? config.css.gridAutoErrorThreshold : 5
		}

		this.mapping = {

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
			"textShadow" : "text-shadow",

			"opacity": "opacity"
		}

		this.paddingProperties = ["paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "padding"]

		this.borderProperties = [
			'borderWidth', 'border', 'borderRadius', 'boderColor',
			'borderBottomColor', 'borderTopColor', 'borderLeftColor', 'borderRightColor',
			'borderTopStyle', 'borderBottomStyle', 'borderRightStyle', 'borderLeftStyle',
			'borderBottomWidth', 'borderTopWidth', 'borderLeftWidth', 'borderRightWidth',
			'borderBottomLeftRadius', 'borderTopLeftRadius', 'borderBottomRightRadius', 'borderTopRightRadius'
		]

		this.borderColorProperties = ['borderBottomColor', 'borderTopColor', 'borderLeftColor', 'borderRightColor']
		this.borderWidthProperties = ['borderBottomWidth', 'borderTopWidth', 'borderLeftWidth', 'borderRightWidth']
		this.borderStyleProperties = ['borderTopStyle', 'borderBottomStyle', 'borderRightStyle', 'borderLeftStyle']
		this.borderRadiusProperties = ['borderBottomLeftRadius', 'borderTopLeftRadius', 'borderBottomRightRadius', 'borderTopRightRadius']

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

		this.widthProperties = [
			'paddingLeft',
			'_paddingLeft',
			'paddingRight',
			'_paddingRight',
			'borderLeftWidth',
			'_borderLeftWidth',
			'borderRightWidth',
			'_borderRightWidth'
		]

		this.easingMapping = {
			'easeInQuad': 'ease-in',
			'easeOutQuad': 'ease-out',
			'linear': 'linear',
			'easeInOutQuad': 'ease-in-out',
			'easeElasticIn': 'ease-in',
			'easeElasticOut': 'ease-out',
			'easeBounceIn': 'ease-in',
			'easeBounceOut': 'ease-out',
		}

		this.fontProperties = ['color', 'fontSize', 'fontWeight', 'textAlign', 'fontStyle', 'letterSpacing', 'lineHeight']

		this.ignoreCorrectWidthAndHeigth = ['CheckBox', 'RadioBox', 'RadioBox2', 'Switch', 'Stepper', 'TypeAheadTextBox', 'Paging']
		//this.isAlwaysFixedHorizontal = ['Switch', 'Stepper']

		this.widgetFactory = new CSSWidgetFactory(this)
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

	getCSS (widget, screen) {
		var result = "";

		var style = widget.style;
		style = Util.fixAutos(style, widget)

		let selector = this.getSelector(widget, screen);
		if (this.widgetFactory['getCSS_' + widget.type]) {
			result += this.widgetFactory['getCSS_' + widget.type](selector, widget.style, widget)
		} else if (widget.isCustomComponent){
			/**
			 * For custom components we just set the position!
			 */
			result += selector + ' {\n'
			result += this.getPosition(widget);
			result += '}\n\n'
		} else {
			/**
			 * Add normal css
			 */
			result += selector + ' {\n'
			result += this.getRawStyle(style, widget);
			result += this.getPosition(widget);
			result += '}\n\n'

			if (widget.hover) {
				result += selector + ':hover {\n'
				result += '  transition: all 0.2s;\n'
				result += this.getRawStyle(widget.hover, widget);
				result += '}\n\n'
			}

			if (widget.focus) {
				result += selector + ':focus {\n'
				result += this.getRawStyle(widget.focus, widget);
				result += '}\n\n'
			}

			if (widget.error) {
				result += selector + ':invalid {\n'
				result += this.getRawStyle(widget.error, widget);
				result += '}\n\n'
			}

			if (widget.active) {
				result += selector + '.qux-active {\n'
				result += this.getRawStyle(widget.active, widget);
				result += '}\n\n'
			}

			if (Util.isInputElement(widget)) {
				console.debug('XXXX', widget)
				result += selector + '::placeholder {\n'
				result += `  color: ${this.getPlaceHolderColor(style.color)};\n`
				result += '}\n\n'
			}
		}

		if (screen && screen.animation && screen.animation.ScreenLoaded) {
			let animation = screen.animation.ScreenLoaded
			if (widget.id in animation.widgets) {
				let widgetAnimation = animation.widgets[widget.id]
				if (widgetAnimation) {
					result += this.getAnimation(widgetAnimation, selector, widget, screen)
				}
			}
		}

		return result
	}

	getAnimation (animation, selector, widget) {
		let result = ''

		let delay = Math.round((animation.delay / (animation.delay + animation.duration)) * 100)
		let animId = `${widget.id}-anim-load`
		let easing = animation.easing ? this.getEasing(animation.easing) : 'linear'

		if (animation.type === 'fadeIn') {

			result +=  `@keyframes ${animId}{\n`
			result += '  0% { opacity:0; }\n'
			result += `  ${delay}% {opacity: 0;}\n`
			result += `  100% {opacity: 1;}\n`
			result += '}\n\n'

			result += selector + ' {\n'
			result += `  animation-name:${animId};\n`
			result += `  animation-duration:${animation.duration}ms;\n`
			result += `  animation-timing-function:${easing};\n`
			result += '}\n\n'
		}

		return result
	}

	getEasing (easing) {
		return this.easingMapping[easing]
	}


	/*********************************************************************
	 * Position
	 *********************************************************************/

	getPosition (widget) {
		// Overlays will no be rendered as fixed...

		/**
		 * FIXME we should have here better support for the
		 * for auto layouts like wrap, row and column
		 */
		if (widget.style.fixed && widget.type !== 'Screen') {
			return this.getFixedPosition(widget)
		} else if (Util.hasWrappedParent(widget)) {
			return this.getWrappedPosition(widget)
		} else  {
			return this.getGridPosition(widget)
		}
	}

	/*********************************************************************
	 * Wrapped Position
	 *********************************************************************/

	getWrappedPosition (widget) {
		Logger.log(3, 'CSSFactory.getWrappedPosition()' + widget.name)
		let result = ''
		/**
		 * For wrapped we just add margins
		 */
		result += `  min-height: ${this.getWrappedHeight(widget)};\n`
		result += `  width: ${this.getWrappedWidth(widget)};\n`
		if (widget.wrapOffSetBottom && widget.wrapOffSetRight && !this.justifyContentInWrapper) {
			result += `  margin-bottom: ${widget.wrapOffSetBottom}px ;\n`
			result += `  margin-right: ${widget.wrapOffSetRight}px ;\n`
		} else {
			result += `  margin: ${widget.wrapOffSetY}px ${widget.wrapOffSetX}px;\n`
		}

		/**
		 * If the wrapped element has a grid, add it as well
		 */
		if (Util.hasGrid(widget)) {
			Logger.log(3, 'CSSFactory.getWrappedPosition() > add grid' + widget.name)
			result += '  display: grid;\n'
			result += '  grid-template-columns: ' + this.getGridColumnTracks(widget.w, widget.grid.columns, widget) + ';\n'
			result += '  grid-template-rows: ' + this.getGridRowTracks(widget.h, widget.grid.rows, widget) + ';\n'
		}
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


	getWrappedHeight (widget) {
		return this.getCorrectedHeight(widget);
	}

	getWrappedWidth (widget) {
		if (this.isFixedHorizontal(widget)){
			return this.getFixedWidth(widget);
		} else {
			return this.getResponsiveWidth(widget)
		}
	}

	setRepeaterContainer (widget) {
		Logger.log(5, 'CSSFactory.setRepeaterContainer() ' + widget.name)
		let result = ''
		result += '  display: flex;\n'
		result += '  flex-direction: row;\n'
		result += '  flex-wrap: wrap;\n'
		result += '  align-items: flex-start;\n'
		result += '  align-content: flex-start;\n'
		if (Util.isRepeaterAuto(widget)) {
			result += '  justify-content: space-between;\n'
		}
		return result
	}

	setWrappedContainer (widget) {
		Logger.log(4, 'CSSFactory.setWrappedContainer() ' + widget.name)
		let result = ''
		result += '  display: flex;\n'
		result += '  flex-direction: row;\n'
		result += '  flex-wrap: wrap;\n'
		result += '  align-items: flex-start;\n'
		result += '  align-content: flex-start;\n'
		if (this.justifyContentInWrapper) {
			result += '  justify-content: space-between;\n'
		}
		return result
	}

	/*********************************************************************
	 * Grid Position
	 *********************************************************************/

	getGridPosition (widget) {
		Logger.log(5, 'CSSFactory.getGridPosition() > ' + widget.name, widget)
		let result = ''

		/**
		 * First determine how we align the children
		 */
		if (widget.grid) {
			result = this.getGridChildAlignment(widget)
		}

		/**
		 * Second align to parent
		 */
		result += this.getGridParentAlign(widget)
		return result
	}

	getGridChildAlignment (widget) {
		let result = ''
		if (Util.isWrappedContainer(widget)) {
			result += this.setWrappedContainer(widget)
		} else if (Util.isRepeaterGrid(widget)) {
			result += this.setRepeaterContainer(widget)
		} else if (Util.isRowGrid(widget)) {
			/**
			 * FIXME: Move this code to the model transformer. The isRow value
			 * will be later used in the getGridParentAlign() method
			 */
			if (!widget.grid) {
				widget.grid = {}
			}
			widget.grid.isRow = true
			result += `  display: flex;\n`
			result += `  flex-direction: column;\n`
		} else {
			result += '  display: grid;\n'
			result += '  grid-template-columns: ' + this.getGridColumnTracks(widget.w, widget.grid.columns, widget) + ';\n'
			result += '  grid-template-rows: ' + this.getGridRowTracks(widget.h, widget.grid.rows, widget, true) + ';\n'
		}
		return result
	}

	getGridParentAlign (widget) {
		Logger.log(5, 'CSSFactory.getGridParentAlign() > ' + widget.name, widget)
		let result = ''

		if (Util.hasParentRepeaterGrid(widget)) {
			Logger.log(3, 'CSSFactory.getGridParentAlign() > ' + widget.name, widget)
			/**
			 * FIXME: Do we need this?
			 * in a repeater we have a parent element that was
			 * aligned by the Grid (qux-repeater-child). We just set the
			 * width
			 */
			result += `  width: 100%;\n`
			if (Util.isFixedVertical(widget)){
				result += `  height: ${this.getCorrectedHeight(widget, true)};\n`
			} else {
				result += `  min-height: ${this.getCorrectedHeight(widget, true)};\n`
				result += `  height: 100%;\n`
			}
		} else if (widget.parent) {
			/**
			 * Check if we have to do a normal flex layout because the grid
			 * is row (=== 1 columns)
			 */
			if (widget.parent.grid && widget.parent.grid.isRow) {
				result += this.getGridParentRowAlignment(widget)
			} else {
				result += `  grid-column-start: ${widget.gridColumnStart + 1};\n`
				result += `  grid-column-end: ${widget.gridColumnEnd + 1};\n`
				result += `  grid-row-start: ${widget.gridRowStart + 1};\n`
				result += `  grid-row-end: ${widget.gridRowEnd + 1};\n`
				if (widget.z) {
					result += `  z-index: ${widget.z};\n`
				}
			}
		} else {
			if (this.isForceGrid && Util.isScreen(widget)){
				result += `  min-height: ${widget.h}px;\n`
			} else {
				result += `  min-height: 100%;\n`
			}
		}
		return result;
	}

	/**
	 * Normal alignment
	 */
	getGridParentRowAlignment (widget) {
		Logger.log(5, 'CSSFactory.getGridParentRowAlignment() > as row: ', widget.name, widget)

		let result = ''
		if (this.isPinnedLeft(widget) && this.isPinnedRight(widget)) {

			result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
			result += `  margin-right: ${this.getPinnedRight(widget)};\n`

		} else if (this.isPinnedLeft(widget)){

			if (this.isFixedHorizontal(widget)){
				result += `  width: ${this.getFixedWidth(widget)};\n`
				result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
			} else {
				result += `  margin-right: ${this.getResponsiveRight(widget)};\n`
				result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
			}

		} else if (this.isPinnedRight(widget)){
			/**
			 * This is a tricky one.
			 */
			if (this.isFixedHorizontal(widget)){
				result += `  width: ${this.getFixedWidth(widget)};\n`
				result += `  margin-left: ${this.getCalcLeft(widget)};\n`
			} else {
				/**
				 * TODO: can we use somehow a reposnive calculated left?
				 */
				result += `  margin-left: ${this.getResponsiveLeft(widget)};\n`
				result += `  margin-right: ${this.getPinnedRight(widget)};\n`
			}

		} else {
			/**
			 * Nothing is pinned.
			 * We are in a rowGrid, this means the widget is alone. Therefore
			 * we can set the margin left and right and not the width.
			 */
			if (this.isFixedHorizontal(widget)){
				if (Util.isCentered(widget)) {
					result += `  width: ${this.getFixedWidth(widget)};\n`
					result += `  margin-left: auto;\n`
					result += `  margin-right: auto;\n`
				} else {
					result += `  width: ${this.getFixedWidth(widget)};\n`
					result += `  margin-left: ${this.getResponsiveLeft(widget)};\n`
				}
			} else {
				result += `  margin-right: ${this.getResponsiveRight(widget)};\n`
				result += `  margin-left: ${this.getResponsiveLeft(widget)};\n`
			}
		}

		if (Util.isFixedVertical(widget)){
			result += `  height: ${this.getCorrectedHeight(widget, true)};\n`
		} else {
			result += `  min-height: ${this.getCorrectedHeight(widget, true)};\n`
		}
		result += `  margin-top: ${this.getPinnedTop(widget)};\n`


		if (Util.isLastChild(widget) && !Util.isRepeater(widget.parent)){
			result += `  margin-bottom: ${this.getPinnedBottom(widget)};\n`
		}

		return result
	}

	/**
	 * Returns the tracks for the grid. It makes sure the biggest element
	 * is auto, so the grid is responsive... we could also use minmax()
	 */
	getGridColumnTracks (total, list, widget) {
		Logger.log(6, 'CSSFactory.getGridColumnTracks() > ' + widget.name, list)
		if (list) {
			/**
			 * FIXME: we could get the max not fixed. Still we would
			 * need to make sure we get the fixed stuff
			 */
			let max = Math.max(...list.map(i => i.l))
			return list.map(i => {

				/**
				 * We might want several autos. This is very sensitive
				 * to small changes in the editor. Therefore we give a
				 * small error margin.
				 */
				if (Math.abs(max - i.l) <= this.gridAutoErrorThreshold) { // max === i.l
					return '1fr'
				}

				/**
				 * Fixed has priority. For rows we have always fixed...
				 */
				if (i.fixed) {
					return i.l + 'px'
				}

				return Math.round(i.l * 100 / total) + '%'
			}).join(' ')
		}
	}

	getGridRowTracks (total, list, widget) {
		Logger.log(6, 'CSSFactory.getGridRowTracks() > ' + widget.name, list)
		if (list) {
			return list.map(i => {
				/**
				 * Fixed rows or spacer (no element starts here)
				 * rows have a fixed size. Everything else is minmax
				 */
				if (i.fixed || i.start.length === 0) {
					return Math.round(i.l) + 'px'
				}
				return `minmax(${Math.round(i.l)}px, auto)`
			}).join(' ')
		}
	}

	/*********************************************************************
	 * Position Helpers
	 *********************************************************************/

	isPinnedLeft (widget) {
		return Util.isPinnedLeft(widget)
	}

	isPinnedRight (widget) {
		return Util.isPinnedRight(widget)
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
		if (Util.isFullWidth(widget)) {
			return '100%'
		}
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
		Logger.warn('CSSFactory.getResponsiveWidth() > No parent! ' + widget.name)
		return  '100%'
	}

	getFixedHeight (widget) {
		return widget.h + 'px'
	}

	getCorrectedHeight (widget, isPosition = false, h = -1) {
		if (h < 0) {
			h = widget.h
		}
		/**
		 * when we are positioning, we only sustract
		 * for certain widgets
		 */
		if (isPosition && this.ignoreCorrectWidthAndHeigth.indexOf(widget.type) >= 0) {
			return h + 'px'
		}
		this.heightProperties.forEach(key => {
			if (widget.style[key]) {
				h -= widget.style[key]
			}
		})
		return h + 'px'
	}

	getCorrectedWidth (widget, isPosition = false, w = -1) {
		if (w < 0) {
			w = widget.w
		}
		if (isPosition && this.ignoreCorrectWidthAndHeigth.indexOf(widget.type) >= 0) {
			return w + 'px'
		}
		this.widthProperties.forEach(key => {
			if (widget.style[key]) {
				w -= widget.style[key]
			}
		})
		return w + 'px'
	}

	isFixedHorizontal (widget){
		return Util.isFixedHorizontal(widget)
	}

	/*********************************************************************
	 * Fixed Position
	 *********************************************************************/

	getFixedPosition (widget) {
		let result = '  position: fixed;\n';
		if (this.isFixedHorizontal(widget)){
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
		if (Util.isPinnedDown(widget)){
			result += `  bottom: ${widget.bottom}px;\n`
		} else {
			result += `  top: ${widget.y}px;\n`
		}

		result += `  height: ${this.getCorrectedHeight(widget)};\n`

		/**
		 * Align children in grid
		 */
		result += this.getGridChildAlignment(widget)

		return result
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
		result += `  min-height: ${h}${unitY};\n`
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

	getStyleByKey (style, widget, keys) {
		var result = ''
		keys.forEach( key => {
			if (style[key] !== undefined && style[key] !== null) {
				var value = style[key];
				result += '  ' + this.getKey(key) + ': ' + this.getValue(key, value) + ';\n'
			}
		})
		return result;
	}

	getRawStyle (style, widget) {

		var result = this.getStyleByKey(style, widget, Object.keys(this.mapping))
		result += this.getBackGround(style, widget)
		return result;
	}

	getPlaceHolderColor (color) {
		if (c) {
			var c = Color.fromString(color);
			c.a = 0.5;
			return color.toString(c);
		}
		return 'rgba(255, 255, 255, 0.5)'
	}

	getBackGround(style, widget) {
		let result = ''

		if (style.background && style.overlay !== true) {
			if (style.background.colors) {
				let background = style.background
				let gradient = "(" + background.direction + "deg";
				for (var i = 0; i < background.colors.length; i++) {
					var color = background.colors[i];
					gradient += "," + color.c + " " + color.p + "% ";
				}
				gradient += ")";
				result += `  background: linear-gradient${gradient};\n`
			} else {
				result += `  background-color: ${style.background};\n`
			}
		}
		if (style.backgroundColor) {
			result += `  background-color: ${style.backgroundColor};\n`
		}

		if (style.backgroundImage && style.backgroundImage.url) {

			if (style.backgroundImage.url.indexOf('http') === 0) {
				result += `  background-image: url(${style.backgroundImage.url});\n`
			} else {
				result += `  background-image: url(${this.imagePrefix}/${style.backgroundImage.url});\n`
			}

			if (style.backgroundSize) {
				result += `  background-size: ${style.backgroundSize }%;\n`
			} else {
				result += `  background-size: 100%;\n`
			}

			if (style.backgroundPosition) {
				var pos = style.backgroundPosition;
				let w = Math.round(pos.left * widget.w)
				let h = Math.round(pos.top * widget.h)
				result += `  background-position: ${w}px ${h}px;\n`
			} else {
				result += `  background-position: 0px 0px;\n`
			}
			result += `  background-repeat: no-repeat;\n`
		}
		return result
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