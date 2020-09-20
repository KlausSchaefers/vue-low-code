import Logger from '../../core/Logger'


import PagingCSS from './PagingCSS'
import TableCSS from './TableCSS'
import ImageCSS from './ImageCSS'
import ScreenCSS from './ScreenCSS'
import RepeaterCSS from './RepeaterCSS'
import ChartCSS from './ChartCSS'
import VectorCSS from './VectorCSS'
import TimelineCSS from './TimelineCSS'
import SegmentCSS from './SegmentCSS'
import UploadCSS from './UploadCSS'
import CameraCSS from './CameraCSS'
import UploadPreviewCSS from './UploadPreviewCSS'

export default class CSSWidgetFactory {

  constructor(cssFactory) {
    Logger.log(5, 'CSSWidgetFactory.constructor()')
    this.cssFactory = cssFactory
    this.factories = {
      'Paging':  new PagingCSS(cssFactory),
      'Table': new TableCSS(cssFactory),
      'Image': new ImageCSS(cssFactory),
      'Screen': new ScreenCSS(cssFactory),
      'Repeater': new RepeaterCSS(cssFactory),
      'BarChart': new ChartCSS(cssFactory),
      'Vector': new VectorCSS(cssFactory),
      'Timeline': new TimelineCSS(cssFactory),
      'Segment': new SegmentCSS(cssFactory),
      'Upload': new UploadCSS(cssFactory),
      'Camera': new CameraCSS(cssFactory),
      'UploadPreview': new UploadPreviewCSS(cssFactory)
    }
  }

  getCSS_UploadPreview(selector, style, widget) {
    Logger.log(5, 'getCSS_UploadPreview', widget)
    return this.factories.UploadPreview.run(selector, style, widget)
  }

  getCSS_Camera (selector, style, widget) {
    Logger.log(5, 'getCSS_Camera', widget)
    return this.factories.Camera.run(selector, style, widget)
  }

  getCSS_Upload (selector, style, widget) {
    Logger.log(5, 'getCSS_Upload', widget)
    return this.factories.Upload.run(selector, style, widget)
  }

  getCSS_BarChart (selector, style, widget) {
    Logger.log(5, 'getCSS_BarChart', widget)
    return this.factories.BarChart.run(selector, style, widget)
  }

  getCSS_RingChart (selector, style, widget) {
    Logger.log(5, 'getCSS_RingChart', widget)
    return this.factories.BarChart.run(selector, style, widget)
  }

  getCSS_SegmentButton (selector, style, widget) {
    Logger.log(5, 'getCSS_SegmentButton', widget)
    return this.factories.Segment.run(selector, style, widget)
  }

  getCSS_Timeline (selector, style, widget) {
    Logger.log(5, 'getCSS_Timeline', widget)
    return this.factories.Timeline.run(selector, style, widget)
  }

  getCSS_Vector (selector, style, widget) {
    Logger.log(5, 'getCSS_Vector', widget)
    return this.factories.Vector.run(selector, style, widget)
  }

  getCSS_PieChart (selector, style, widget) {
    Logger.log(5, 'getCSS_PieChart', widget)
    return this.factories.BarChart.run(selector, style, widget)
  }

  getCSS_MultiRingChart (selector, style, widget) {
    Logger.log(5, 'getCSS_MultiRingChart', widget)
    return this.factories.BarChart.run(selector, style, widget)
  }

  getCSS_Screen (selector, style, widget) {
    Logger.log(5, 'getCSS_Screen', widget)
    return this.factories.Screen.run(selector, style, widget)
  }

  getCSS_Repeater(selector, style, widget) {
    Logger.log(5, 'getCSS_Repeater', widget)
    return this.factories.Repeater.run(selector, style, widget)
  }

  getCSS_Icon(selector, style, widget) {
    let result = ''
    result += selector + ' {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    result += this.cssFactory.getPosition(widget);
    result += `  font-size:${widget.h}px;\n`
    result += `  line-height:1;\n`
    result += '}\n\n'

    result += selector + ' .mdi:before {\n'
    result += `  font-size:${widget.h}px;\n`
    result += '}\n\n'

    return result
  }

  getCSS_ChildrenToggle(selector, style, widget) {

    /**
     * For now we assume this thingy has a fixed width...
     */

    let result = ''
    result += selector + ' {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    result += this.cssFactory.getPosition(widget);
    result += `  width:${widget.w}px;\n`
    result += '}\n\n'


    if (widget.active) {
      result += selector + '.qux-active {\n'
      result += this.getRawStyle(widget.active, widget);
      result += '}\n\n'
    }

    /**
     * We should add here still some other stuff for children...
     */

    return result
  }


  getCSS_RadioGroup(selector, style, widget) {
    let result = ''

    let correctedHeight = this.cssFactory.getCorrectedHeight(widget, false, widget.style.boxHeight)
    let height = widget.style.boxHeight + 'px'

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += selector + '.qux-radiobox {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)

    result += `  height:${height};\n`
    result += `  width:${height};\n`
    result += '}\n\n'


    result += selector + ' .qux-radiobox-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)
    result += `  height:${correctedHeight};\n`
    result += `  width:${correctedHeight};\n`
    result += '}\n\n'


    result += selector + ' .qux-radiobox-hook {\n'
    result += `  background: ${style.colorButton};\n`
    result += '}\n\n'

    result += selector + ' .qux-radiobox-label {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.fontProperties)
    result += '}\n\n'

    if (widget.checked) {
      result += selector + '.qux-radiobox-checked .qux-radiobox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.checked, widget, this.cssFactory.borderColorProperties)
      result += '}\n\n'
    }


    return result
  }


  getCSS_CheckBoxGroup(selector, style, widget) {
    let result = ''

    let correctedHeight = this.cssFactory.getCorrectedHeight(widget, false, widget.style.boxHeight)
    let height = widget.style.boxHeight + 'px'

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += selector + '.qux-checkbox {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)

    result += `  height:${height};\n`
    result += `  width:${height};\n`
    result += '}\n\n'


    result += selector + ' .qux-checkbox-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)
    result += `  height:${correctedHeight};\n`
    result += `  width:${correctedHeight};\n`
    result += '}\n\n'


    result += selector + ' .qux-checkbox-hook {\n'
    result += `  border-color: ${style.colorButton};\n`
    result += `  border-bottom-width: ${Math.round(height/ 10)}px;\n`
    result += `  border-right-width:  ${Math.round(height / 10)}px;\n`
    result += '}\n\n'

    result += selector + ' .qux-checkbox-label {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.fontProperties)
    result += '}\n\n'

    if (widget.checked) {
      result += selector + '.qux-checkbox-checked .qux-checkbox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.checked, widget, this.cssFactory.borderColorProperties)
      result += '}\n\n'
    }

    return result
  }


  getCSS_RadioBox2(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += selector + ' .qux-radiobox-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)
    result += `  height:${this.cssFactory.getCorrectedHeight(widget)};\n`
    result += `  width:${this.cssFactory.getCorrectedWidth(widget)};\n`
    result += '}\n\n'


    result += selector + ' .qux-radiobox-hook {\n'
    result += `  background: ${style.colorButton};\n`
    result += '}\n\n'

    if (widget.checked) {
      result += selector + '.qux-radiobox-checked .qux-radiobox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.checked, widget, this.cssFactory.borderColorProperties)
      result += '}\n\n'
    }

    return result
  }

  getCSS_CheckBox(selector, style, widget) {
    let result = ''
    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);

    result += '}\n\n'

    result += selector + ' .qux-checkbox-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)
    result += `  height:${this.cssFactory.getCorrectedHeight(widget)};\n`
    result += `  width:${this.cssFactory.getCorrectedWidth(widget)};\n`
    result += '}\n\n'


    result += selector + ' .qux-checkbox-hook {\n'
    result += `  border-color: ${style.colorButton};\n`
    result += `  border-bottom-width: ${Math.round(widget.h / 10)}px;\n`
    result += `  border-right-width:  ${Math.round(widget.h / 10)}px;\n`
    result += '}\n\n'

    if (widget.checked) {
      result += selector + '.qux-checkbox-checked .qux-checkbox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.checked, widget, this.cssFactory.borderColorProperties)
      result += '}\n\n'
    }

    return result
  }


  getCSS_Switch(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    let cntrHeight = this.cssFactory.getCorrectedHeight(widget, false, widget.h)
    let cntrWidth = this.cssFactory.getCorrectedWidth(widget, false, widget.w)
    if (style.cssClass === 'MatcWidgetTypeSwitchThin') {
      cntrHeight = '50%';
    }

    result += selector + ' .qux-switch-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += `  height:${cntrHeight};\n`
    result += `  width:${cntrWidth};\n`
    result += '}\n\n'

    const borderWidthButton = style.borderWidthButton ? style.borderWidthButton : 0
    const borderColorButton = style.borderWidthborderColorButtonutton ? style.borderColorButton : 'rbga(0,0,0,0)'
    result += selector + ' .qux-switch-handle {\n'
    result += `  background:${style.colorButton};\n`
    result += `  border-radius:${style.borderRadius};\n`
    result += `  border-width:${borderWidthButton}px;\n`
    result += `  border-color:${borderColorButton};\n`
    result += this.cssFactory.getStyleByKey(style, widget, ['boxShadow'])
    result += `  height: ${widget.h}px;\n`
    result += `  width: ${widget.h}px;\n`
    result += '}\n\n'

    result += selector + '.qux-active .qux-switch-handle {\n'
    result += `  left:calc(100% - ${widget.h}px);\n`
    result += '}\n\n'

    result += selector + ' .qux-switch-on {\n'
    result += `  background:${style.background};\n`
    result += '}\n\n'

    result += selector + ' .qux-switch-off {\n'
    result += `  background:${style.colorForeGround};\n`
    result += '}\n\n'

    return result
  }

  getCSS_MobileDropDown(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    // make sure we have always some focus
    result += this.addOpenZIndex(selector)

    result += this._addCaret(selector, widget, style)

    result += selector + ' .qux-dropdown-popup {\n'
    result += `  background:${style.popupBackground};\n`
    result += `  color:${style.popupColor};\n`
    result += '}\n\n'

    if (widget.focus) {
      result += selector + ':hover {\n'
      result += this.cssFactory.getRawStyle(widget.focus, widget);
      result += '}\n\n'
      result += this._addCaret(selector + ':hover', widget, widget.focus)

      result += selector + ':hover .qux-dropdown-popup {\n'
      result += this.cssFactory.getStyleByKey(widget.focus, widget, this.cssFactory.borderProperties)
      result += '}\n\n'
    }

    return result
  }

  getCSS_DropDown(selector, style, widget) {

    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += this._addCaret(selector, widget, style)

    // make sure we have always some focus
    result += this.addOpenZIndex(selector)

    result += selector + ':not(.qux-dropdown-mobile) .qux-dropdown-popup {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += '}\n\n'

    result += selector + ':not(.qux-dropdown-mobile) .qux-dropdown-item {\n'
    result += `  background:${style.popupBackground};\n`
    result += `  color:${style.popupColor};\n`
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.paddingProperties)
    result += '}\n\n'


    result += selector + ':not(.qux-dropdown-mobile) .qux-dropdown-item:hover {\n'
    result += `  background:${style.selectedOptionBackground};\n`
    result += `  color:${style.selectedOptionColor};\n`
    result += '}\n\n'

    if (widget.focus) {
      result += selector + ':hover {\n'
      result += this.cssFactory.getRawStyle(widget.focus, widget);
      result += '}\n\n'
      result += this._addCaret(selector + ':hover', widget, widget.focus)

      result += selector + ':hover .qux-dropdown-popup {\n'
      result += this.cssFactory.getStyleByKey(widget.focus, widget, this.cssFactory.borderProperties)
      result += '}\n\n'
    }

    return result
  }

  _addCaret(selector, widget, style) {
    let result = ''
    if (widget.props && widget.props.caretBorderColor) {
      result += selector + ' .qux-dropdown-expend {\n'
      result += `  background:${style._borderRightColor};\n`
      result += '}\n\n'

      result += selector + ' .qux-dropdown-carret {\n'
      result += `  color:${style.background};\n`
      result += '}\n\n'
    }

    return result
  }

  getCSS_Stepper(selector, style, widget) {

    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    if (widget.hover) {
      result += selector + ' .qux-stepper-btn:hover {\n'
      result += `  background:${widget.hover.background};\n`
      result += `  color:${widget.hover.color};\n`
      result += '}\n\n'
    }

    return result
  }

  getCSS_HSlider(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += selector + ' .qux-slider-track {\n'
    result += `  background:${style.background};\n`
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += '}\n\n'

    result += selector + ' .qux-slider-progress {\n'
    result += `  background:${style.barColor};\n`
    result += '}\n\n'

    result += selector + ' .qux-slider-handle  {\n'
    result += `  background:${style.handleColor};\n`
    result += `  border-radius:${style.handleRadius}%;\n`
    result += `  height:${style.handleHeight * widget.h}px;\n`
    result += `  width:${style.handleWidth }px;\n`
    result += '}\n\n'

    result += selector + ' .qux-slider-handle-cntr  {\n'
    result += `  margin-left: ${style.handleWidth / 2}px;\n`
    result += `  width: calc(100% - ${style.handleWidth}px);\n`
    result += '}\n\n'

    return result
  }


  getCSS_Date(selector, style, widget, isInPopup = false) {
    let result = ''

    if (!isInPopup) {
      result += selector + ' {\n'
      result += this.cssFactory.getRawStyle(style, widget);
      result += this.cssFactory.getPosition(widget);
      result += '}\n\n'
    }

    if (style.tableBorderWidth) {
      result += selector + ' table {\n'
      result += `  border-spacing:${style.tableBorderWidth}px;\n`
      result += `  border-collapse: separate;\n`
      result += '}\n\n'
    }

    result += selector + ' .qux-date-week-days {\n'
    result += `  background:${style.tableHeaderBackground};\n`
    result += `  color:${style.tableHeaderColor};\n`
    result += '}\n\n'

    result += selector + ' .qux-date-header {\n'
    result += `  background:${style.headerBackground};\n`
    result += `  color:${style.headerColor};\n`
    result += '}\n\n'

    if (style.weekendBackground && style.weekendColor) {
      result += selector + ' .qux-date-weekend {\n'
      result += `  background:${style.weekendBackground};\n`
      result += `  color:${style.weekendColor};\n`
      result += '}\n\n'
    }

    if (style.weekdayBackground && style.weekdayColor) {
      result += selector + ' .qux-date-workday {\n'
      result += `  background:${style.weekdayBackground};\n`
      result += `  color:${style.weekdayColor};\n`
      result += '}\n\n'
    }

    if (widget.props.range) {

      result += selector + ' .qux-date-range-start {\n'
      result += `  background:${style.selectedBackground};\n`
      result += `  color:${style.selectedColor};\n`
      if (style.itemBorderRadius) {
        result += `  border-radius:${style.itemBorderRadius}%;\n`
      }
      result += '}\n\n'

      result += selector + ' .qux-date-range-end {\n'
      result += `  background:${style.selectedBackground};\n`
      result += `  color:${style.selectedColor};\n`
      if (style.itemBorderRadius) {
        result += `  border-radius:${style.itemBorderRadius}%;\n`
      }
      result += '}\n\n'

      result += selector + ' .qux-date-range-middle {\n'
      result += `  background:${style.selectedInRangeBackground};\n`
      result += `  color:${style.selectedInRangeColor};\n`
      if (style.itemBorderRadius) {
        result += `  border-radius:${style.itemBorderRadius}%;\n`
      }
      result += '}\n\n'

    } else {
      result += selector + ' .qux-date-selected {\n'
      result += `  background:${style.selectedBackground};\n`
      result += `  color:${style.selectedColor};\n`
      if (style.itemBorderRadius) {
        result += `  border-radius:${style.itemBorderRadius}%;\n`
      }
      result += '}\n\n'
    }


    return result
  }

  getCSS_DateDropDown(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    // make sure we have always some focus
    result += this.addOpenZIndex(selector)

    result += this._addCaret(selector, widget, style)

    result += selector + ' .qux-date-picker-popup {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += `  width:${style.fontSize * 18}px;\n`
    result += `  height:${style.fontSize * 18}px;\n`
    result += '}\n\n'

    result += this.getCSS_Date(selector + " .qux-date-picker-popup", style, widget, true)

    return result
  }

  getCSS_Rating(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += `  color:${style.color};\n`
    result += `  font-size:${widget.h}px;\n`
    result += '}\n\n'

    return result
  }

  getCSS_LabeledIconToggle(selector, style, widget) {
    return this.getCSS_IconToggle(selector, style, widget)
  }

  getCSS_IconToggle(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties)
    result += `  color:${style.passiveColor};\n`
    result += `  font-size:${style.fontSize}px;\n`
    result += '}\n\n'

    result += selector + '.qux-icon-toggle-selected {\n'
    result += `  color:${style.activeColor};\n`
    result += '}\n\n'

    result += selector + ' .qux-icon {\n'
    result += `  font-size:${widget.h}px;\n`
    result += '}\n\n'

    return result
  }


  getCSS_TypeAheadTextBox(selector, style, widget) {

    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += selector + ' .qux-combo-input {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    let paddingH = style._paddingLeft + style._paddingRight;
    let paddingV = style._paddingTop + style._paddingBottom;
    result += `  width:calc(100% - ${paddingH}px);\n`
    result += `  height:calc(100% - ${paddingV}px);\n`
    result += '}\n\n'


    // make sure we have always some focus
    result += this.addOpenZIndex(selector)

    result += selector + ' .qux-combo-popup {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += '}\n\n'


    result += selector + ' .qux-combo-item {\n'
    result += `  background:${style.background};\n`
    result += `  color:${style.color};\n`
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.paddingProperties)
    result += '}\n\n'


    result += selector + ' .qux-combo-item:hover,\n'
    result += selector + ' .qux-combo-item-selected {\n'
    result += `  background:${style.selectedOptionBackground};\n`
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.paddingProperties)
    result += `  color:${style.selectedOptionColor};\n`
    result += '}\n\n'

    // FIXME: make here a default style for mobile?


    if (widget.focus) {
      result += selector + ':hover {\n'
      result += this.cssFactory.getRawStyle(widget.focus, widget);
      result += '}\n\n'
      result += this._addCaret(selector + ':hover', widget, widget.focus)

      //result += selector + ':hover .qux-combo-popup {\n'
      //result += this.cssFactory.getStyleByKey(widget.focus, widget, this.cssFactory.borderProperties)
      //result += '}\n\n'
    }

    return result
  }

  getCSS_Image(selector, style, widget){
    return this.factories.Image.run(selector, style, widget)
  }


  getCSS_Paging(selector, style, widget){
    return this.factories.Paging.run(selector, style, widget)
  }

  getCSS_Table(selector, style, widget) {
    return this.factories.Table.run(selector, style, widget)
  }

  addOpenZIndex (selector) {
      let result = ''
      result += selector + '.qux-open {\n'
      result += `  z-index: 1000;\n`
      result += '}\n\n'
      return result
  }

}