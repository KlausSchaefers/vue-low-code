import Logger from "./Logger"
import * as Util from "./ExportUtil"

export default class CSSLayouter {

  constructor (config, f) {
		this.cssFacotory = f

		this.gridAutoErrorThreshold = 5

		if (config.css) {
			this.isForceGrid = config.css.grid
			this.justifyContentInWrapper = config.css.justifyContentInWrapper
			this.prefix = config.css.prefix ? config.css.prefix : ''
			this.gridAutoErrorThreshold = config.css.gridAutoErrorThreshold ? config.css.gridAutoErrorThreshold : 5
		}

		if (config.responsive) {
			this.responsive = config.responsive
		}


    this.ignoreCorrectWidthAndHeigth = [
      'CheckBox',
      'RadioBox',
      'RadioBox2',
      'Switch',
      'Stepper',
      'TypeAheadTextBox',
      'Paging',
      'Camera'
    ]

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
  }

	/*********************************************************************
	 * Design System
	 *********************************************************************/

	getDesignSystemPosition(widget) {
		Logger.log(0, "CSSLayouter.getDesignSystemPosition()" + widget.name, widget)

		let result = ""
		if (this.isInlineGrid(widget)) {
			result += `  display:inline-grid;\n`
		} else if (this.isInlineBlock(widget)) {
			result += `  display:inline-block;\n`
		} else {
			result += `  display:block;\n`
		}

		/**
		 * For wrapped we just add margins
		 *
		 * What about Figma? We never assume stuff is fixed with?
		 */
		if (Util.isFixedHorizontal(widget)) {
			result += `  width: ${this.getCorrectedWidth(widget)};\n`
		} else if (Util.hasMinMaxWdith(widget)) {
			result += this.getMinMaxWidth(widget, false)
		}else {
			result += `  width: auto;\n`
		}
		if (Util.isFixedVertical(widget)) {
			result += `  height: ${this.getCorrectedHeight(widget)};\n`
		} else {
			result += `  min-height: ${this.getCorrectedHeight(widget)};\n`
		}

		if (Util.hasGrid(widget) && Util.hasChildren(widget)) {
			Logger.log(3, "CSSFactory.getComponentScreenPosition() > add grid" + widget.name)
			result += "  display: inline-grid;\n"
			result += "  grid-template-columns: " + this.getGridColumnTracks(widget.w, widget.grid.columns, widget) + ";\n"
			result += "  grid-template-rows: " + this.getGridRowTracks(widget.h, widget.grid.rows, widget) + ";\n"
		}

		return result
	}

	getMinMaxWidth (widget, isWrapped = false) {
		let result = ""
		if (widget.style && widget.style.minWidth) {
			result += `  min-width: ${widget.style.minWidth}px;\n`
		}
		if (widget.style && widget.style.maxWidth) {
			result += `  max-width: ${widget.style.maxWidth}px;\n`
		}
		/**
		 * We need to make sure that we also include the reponsive with,
		 * to make it 'push' outwards
		 */
		if (isWrapped) {
			result += `  width: ${this.getResponsiveWidth(widget)};\n`
		}
		return result
	}

	isInlineBlock (widget) {
		return widget.qtype !== 'qContainer'
	}

	isInlineGrid (widget) {
		return widget.style && widget.style.verticalAlign === 'middle'
	}

	/*********************************************************************
	 * Child of component screen
	 *********************************************************************/

	getComponentScreenPosition(widget) {
		Logger.log(3, "CSSFactory.getComponentScreenPosition()" + widget.name)
		let result = ""
		/**
		 * For wrapped we just add margins
		 */
		result += `  height:100%;\n`
		result += `  width: 100%;\n`

		if (Util.hasGrid(widget)) {
			Logger.log(-1, "CSSFactory.getComponentScreenPosition() > add grid" + widget.name)
			result += "  display: grid;\n"
			result += "  grid-template-columns: " + this.getGridColumnTracks(widget.w, widget.grid.columns, widget) + ";\n"
			result += "  grid-template-rows: " + this.getGridRowTracks(widget.h, widget.grid.rows, widget) + ";\n"
		}

		return result
	}

	/*********************************************************************
	 * Wrapped Position
	 *********************************************************************/

	getWrappedPosition(widget) {
		Logger.log(3, "CSSFactory.getWrappedPosition()" + widget.name)
		let result = ""
		/**
		 * For wrapped we just add margins
		 */
		result += `  min-height: ${this.getWrappedHeight(widget)};\n`
		result += this.getWrappedWidth(widget)
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
			Logger.log(3, "CSSFactory.getWrappedPosition() > add grid" + widget.name)
			result += "  display: grid;\n"
			result += "  grid-template-columns: " + this.getGridColumnTracks(widget.w, widget.grid.columns, widget) + ";\n"
			result += "  grid-template-rows: " + this.getGridRowTracks(widget.h, widget.grid.rows, widget) + ";\n"
		} else {
			widget.grid.isRow = true
			result += `  display: flex;\n`
			result += `  flex-direction: column;\n`
		}
		return result
	}

	getWrappedEnd(selector, widget) {
		let result = ""
		if (Util.isWrappedContainer(widget)) {
			result += selector + ":after {\n"
			result += `  content:'';\n`
			result += `  flex:auto;\n`
			result += "}\n\n"
		}
		return result
	}

	getWrappedHeight(widget) {
		return this.getCorrectedHeight(widget)
	}

	getWrappedWidth(widget) {
		Logger.log(-1, "CSSFactory.getWrappedWidth() " + widget.name, Util.hasMinMaxWdith(widget))
		if (Util.hasMinMaxWdith(widget)) {
			return this.getMinMaxWidth(widget, true)
		}
		if (this.isFixedHorizontal(widget)) {
			return `  width: ${this.getFixedWidth(widget)};\n`
		}
		return `  width: ${this.getResponsiveWidth(widget)};\n`
	}

	setRepeaterContainer(widget) {
		Logger.log(5, "CSSFactory.setRepeaterContainer() " + widget.name)
		let result = ""
		result += "  display: flex;\n"
		result += "  flex-direction: row;\n"
		result += "  flex-wrap: wrap;\n"
		result += "  align-items: flex-start;\n"
		result += "  align-content: flex-start;\n"
		if (Util.isRepeaterAuto(widget)) {
			result += "  justify-content: space-between;\n"
		}
		return result
	}

	setWrappedContainer(widget) {
		Logger.log(4, "CSSFactory.setWrappedContainer() " + widget.name)
		let result = ""
		result += "  display: flex;\n"
		result += "  flex-direction: row;\n"
		result += "  flex-wrap: wrap;\n"
		result += "  align-items: flex-start;\n"
		result += "  align-content: flex-start;\n"
		if (this.justifyContentInWrapper) {
			result += "  justify-content: space-between;\n"
		}
		return result
	}

	/*********************************************************************
	 * Grid Position
	 *********************************************************************/

	getGridPosition(widget) {
		Logger.log(3, "CSSFactory.getGridPosition() > " + widget.name, widget)
		let result = ""

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

	getGridChildAlignment(widget) {
		let result = ""
		if (Util.isWrappedContainer(widget)) {
			result += this.setWrappedContainer(widget)
		} else if (Util.isRepeaterGrid(widget)) {
			result += this.setRepeaterContainer(widget)
		} else if (Util.isRowGrid(widget) && !widget.isComponentScreen) {
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
			result += "  display: grid;\n"
			result += "  grid-template-columns: " + this.getGridColumnTracks(widget.w, widget.grid.columns, widget) + ";\n"
			result += "  grid-template-rows: " + this.getGridRowTracks(widget.h, widget.grid.rows, widget, true) + ";\n"
		}
		return result
	}

	getGridParentAlign(widget) {
		Logger.log(6, "CSSFactory.getGridParentAlign() > " + widget.name, widget)
		let result = ""

		if (Util.hasParentRepeaterGrid(widget)) {
			Logger.log(3, "CSSFactory.getGridParentAlign() > " + widget.name, widget)
			/**
			 * FIXME: Do we need this?
			 * in a repeater we have a parent element that was
			 * aligned by the Grid (qux-repeater-child). We just set the
			 * width
			 */
			result += `  width: 100%;\n`
			if (Util.isFixedVertical(widget)) {
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
			if (this.isForceGrid && Util.isScreen(widget)) {
				result += `  min-height: ${widget.h}px;\n`
			} else {
				result += `  min-height: 100%;\n`
			}
		}
		return result
	}

	/**
	 * Normal alignment when places as rows in flex
	 */
	getGridParentRowAlignment(widget) {
		Logger.log(5, "CSSFactory.getGridParentRowAlignment() > as row: ", widget.name, widget)

		let result = ""
		if (this.isPinnedLeft(widget) && this.isPinnedRight(widget)) {
			result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
			result += `  margin-right: ${this.getPinnedRight(widget)};\n`
		} else if (this.isPinnedLeft(widget)) {
			if (this.isFixedHorizontal(widget)) {
				result += `  width: ${this.getFixedWidth(widget)};\n`
				result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
			} else {
				result += `  margin-right: ${this.getResponsiveRight(widget)};\n`
				result += `  margin-left: ${this.getPinnedLeft(widget)};\n`
			}
		} else if (this.isPinnedRight(widget)) {
			/**
			 * This is a tricky one.
			 */
			if (this.isFixedHorizontal(widget)) {
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
			if (this.isFixedHorizontal(widget)) {
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

		if (Util.isFixedVertical(widget)) {
			result += `  height: ${this.getCorrectedHeight(widget, true)};\n`
		} else {
			result += `  min-height: ${this.getCorrectedHeight(widget, true)};\n`
		}
		result += `  margin-top: ${this.getPinnedTop(widget)};\n`

		return result
	}


	/**
	 * Returns the tracks for the grid. It makes sure the biggest element
	 * is auto, so the grid is responsive... we could also use minmax()
	 */
	getGridColumnTracks(total, list) {
		Logger.log(6, "CSSFactory.getGridColumnTracks() > ", list)
		if (list) {
			/**
			 * FIXME: we could get the max not fixed. Still we would
			 * need to make sure we get the fixed stuff
			 */
			let max = Math.max(...list.map((i) => i.l))
			return list
				.map((i) => {
					/**
					 * We might want several autos. This is very sensitive
					 * to small changes in the editor. Therefore we give a
					 * small error margin. Use minmax to prevent blowout
					 * https://css-tricks.com/preventing-a-grid-blowout/
					 */
					if (Math.abs(max - i.l) <= this.gridAutoErrorThreshold) {
						// max === i.l
						/**
						 * If we have a min max , we use max-content.
						 */
						if (i.hasMinMax) {
							return "minmax(0,max-content)" //'1fr'
						} else {
							return "minmax(0,1fr)" //'1fr'
						}
					}

					// TODO: Check if we have min max??????

					/**
					 * Fixed has priority. For rows we have always fixed...
					 */
					if (i.fixed) {
						return i.l + "px"
					}

					return Math.round((i.l * 100) / total) + "%"
				})
				.join(" ")
		}
	}

	getGridRowTracks(total, rows) {
		Logger.log(6, "CSSFactory.getGridRowTracks() > ", rows)
		if (rows) {
			return rows
				.map((row, index) => {
					/**
					 * The last row will be free space, if it is
					 * not fixed
					 */
					if (!row.fixed && index === rows.length - 1) {
						return "1fr"
					}
					/**
					 * Fixed rows or spacer (no element starts here, or first)
					 * rows have a fixed size. Everything else is minmax
					 */
					if (row.fixed || row.start.length === 0 || index === 0) {
						return Math.round(row.l) + "px"
					}
					return `minmax(${Math.round(row.l)}px, auto)`
				})
				.join(" ")
		}
	}

	/*********************************************************************
	 * Position Helpers
	 *********************************************************************/

	isPinnedLeft(widget) {
		return Util.isPinnedLeft(widget)
	}

	isPinnedRight(widget) {
		return Util.isPinnedRight(widget)
	}

	getPinnedBottom(widget) {
		if (widget.parent) {
			let parent = widget.parent
			let innerHeight = parent.children
				.map((c) => {
					// grid has top
					if (c.top != undefined) {
						return c.h + c.top
					}
					return c.h + c.y
				})
				.reduce((a, b) => a + b, 0)
			return Math.max(0, parent.h - innerHeight) + "px"
		}
		return "auto"
	}

	getFixedWidth(widget) {
		if (Util.isFullWidth(widget)) {
			return "100%"
		}
		return widget.w + "px"
	}

	getFixedTop(widget) {
		return widget.y + "px"
	}

	getPinnedTop(widget) {
		return widget.top + "px"
	}

	getCalcLeft(widget) {
		if (widget.parent) {
			let right = widget.parent.w - (widget.x + widget.w)
			return `calc(100% - ${widget.w + right}px)`
		}
		return "0px"
	}

	getResponsiveLeft(widget) {
		if (widget.parent) {
			return Math.round((widget.x * 100) / widget.parent.w) + "%"
		}
		return widget.x + "px"
	}

	getResponsiveRight(widget) {
		if (widget.parent) {
			let right = widget.parent.w - (widget.x + widget.w)
			return Math.round((right * 100) / widget.parent.w) + "%"
		}
		return widget.x + "px"
	}

	getPinnedLeft(widget) {
		return widget.x + "px"
	}

	getPinnedRight(widget) {
		if (widget.parent) {
			if (widget.absX) {
				return widget.parent.w - (widget.absX + widget.w) + "px"
			} else {
				return widget.parent.w - (widget.x + widget.w) + "px"
			}
		}
		return "0px"
	}

	getResponsiveWidth(widget) {
		if (widget.parent) {
			/**
			 * What about border...
			 */
			return Math.round((widget.w * 100) / widget.parent.w) + "%"
		}
		Logger.warn("CSSFactory.getResponsiveWidth() > No parent! " + widget.name)
		return "100%"
	}

	getFixedHeight(widget) {
		return widget.h + "px"
	}

	getCorrectedHeight(widget, isPosition = false, h = -1) {
		if (h < 0) {
			h = widget.h
		}
		/**
		 * when we are positioning, we only sustract
		 * for certain widgets
		 */
		if (isPosition && this.ignoreCorrectWidthAndHeigth.indexOf(widget.type) >= 0) {
			return h + "px"
		}
		this.heightProperties.forEach((key) => {
			if (widget.style[key]) {
				h -= widget.style[key]
			}
		})
		return h + "px"
	}

	getCorrectedWidth(widget, isPosition = false, w = -1) {
		if (w < 0) {
			w = widget.w
		}
		if (isPosition && this.ignoreCorrectWidthAndHeigth.indexOf(widget.type) >= 0) {
			return w + "px"
		}
		this.widthProperties.forEach((key) => {
			if (widget.style[key]) {
				w -= widget.style[key]
			}
		})
		return w + "px"
	}

	isFixedHorizontal(widget) {
		return Util.isFixedHorizontal(widget)
	}

	/*********************************************************************
	 * Fixed Position
	 *********************************************************************/

	getFixedPosition(widget) {
		let result = "  position: fixed;\n"
		if (this.isFixedHorizontal(widget)) {
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
		if (Util.isPinnedDown(widget)) {
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

	getAbsolutePosition(widget) {
		let result = ""

		/**
		 * If the widget is on the root level, we use teh screen!
		 */
		let w = widget.w
		let h = widget.h
		let top = widget.y
		let left = Math.max(0, widget.x - this.marginWhiteSpaceCorrect)
		let unitX = "px"
		let unitY = "px"

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
			result += "  display: inline-block;\n"
		}

		result += `  width: ${w}px;\n`
		result += `  min-height: ${h}${unitY};\n`
		result += `  margin-top: ${top}${unitY};\n`
		result += `  margin-left: ${left}${unitX};\n`

		return result
	}

	getSiblings(widget) {
		if (widget.parent && widget.parent.children) {
			return widget.parent && widget.parent.children
		}
		return []
	}
}
