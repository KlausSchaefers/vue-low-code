import Logger from '../core/Logger'
import * as Util from '../core/ExportUtil'

export default class CSSWidgetFactory {

  constructor(cssFactory) {
      Logger.log(1, 'CSSWidgetFactory.constructor()')
      this.cssFactory = cssFactory
  }

  getCSS_Repeater(selector, style, widget) {
      Logger.log(0, 'getCSS_Repeater', widget)
      let result = ''
      result += selector + ' {\n'
      result += this.cssFactory.getRawStyle(style, widget);
      result += this.cssFactory.getPosition(widget, screen);
      result += '}\n\n'

      if (Util.isRepeaterGrid(widget)) {
          Logger.log(5, 'getCSS_Repeater () > grid', widget)
          result += selector + ' .qux-repeater-child {\n'
          result += '  display: inline-block;\n';
          let width = 100 / widget.props.columns
          result += `  width: calc(${width}% - ${widget.props.distanceX}px);\n`;
          result += `  margin-bottom:${widget.props.distanceY}px;\n`;
          result += `  align-self: stretch;\n`;
          result += '}\n\n'
      } else if (Util.isRepeaterWrap(widget)) {
          Logger.log(0, 'getCSS_Repeater () > wrap', widget)
          result += selector + ' .qux-repeater-child {\n'
          result += '  display: inline-block;\n';
          let width = this.getChildWidth(widget)
          result += `  width: ${width};\n`;
          result += `  margin-bottom:${widget.props.distanceY}px;\n`;
          result += '}\n\n'
      } else {
          result += selector + ' .qux-repeater-child {\n'
          result += `  margin-bottom:${widget.props.distanceY}px;\n`;
          result += '}\n\n'
      }

      return result
  }

  getCSS_Icon(selector, style, widget) {
      let result = ''
      result += selector + ' {\n'
      result += this.cssFactory.getRawStyle(style, widget);
      result += `  font-size:${widget.h}px;\n`
      result += this.cssFactory.getPosition(widget, screen);
      result += '}\n\n'
      return result
  }

  getCSS_RadioGroup(selector, style, widget) {
      let result = ''

      let correctedHeight = this.cssFactory.getCorrectedHeight(widget, false, widget.style.boxHeight)
      let height = widget.style.boxHeight + 'px'

      result += selector + ' {\n'
      result += this.cssFactory.getPosition(widget, screen);
      result += '}\n\n'

      result += selector + '.qux-radiobox {\n'
      result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
      result += this.cssFactory.getBackGround(style, widget)
      
      result += `  height:${height}\n;`
      result += `  width:${height}\n;`
      result += '}\n\n'


      result += selector + ' .qux-radiobox-cntr {\n'
      result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
      result += this.cssFactory.getBackGround(style, widget)
      result += `  height:${correctedHeight}\n;`
      result += `  width:${correctedHeight}\n;`
      result += '}\n\n'


      result += selector + ' .qux-radiobox-hook {\n'
      result += `  background: ${style.colorButton}\n;`
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
      result += this.cssFactory.getPosition(widget, screen);
      result += '}\n\n'

      result += selector + '.qux-checkbox {\n'
      result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
      result += this.cssFactory.getBackGround(style, widget)
      
      result += `  height:${height}\n;`
      result += `  width:${height}\n;`
      result += '}\n\n'


      result += selector + ' .qux-checkbox-cntr {\n'
      result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
      result += this.cssFactory.getBackGround(style, widget)
      result += `  height:${correctedHeight}\n;`
      result += `  width:${correctedHeight}\n;`
      result += '}\n\n'


      result += selector + ' .qux-checkbox-hook {\n'
      result += `  border-color: ${style.colorButton}\n;`
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
    result += this.cssFactory.getPosition(widget, screen);
    result += '}\n\n'

    result += selector + ' .qux-radiobox-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)
    result += `  height:${this.cssFactory.getCorrectedHeight(widget)}\n;`
    result += `  width:${this.cssFactory.getCorrectedWidth(widget)}\n;`
    result += '}\n\n'


    result += selector + ' .qux-radiobox-hook {\n'
    result += `  background: ${style.colorButton}\n;`
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
    result += this.cssFactory.getPosition(widget, screen);

    result += '}\n\n'

    result += selector + ' .qux-checkbox-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)
    result += `  height:${this.cssFactory.getCorrectedHeight(widget)}\n;`
    result += `  width:${this.cssFactory.getCorrectedWidth(widget)}\n;`
    result += '}\n\n'


    result += selector + ' .qux-checkbox-hook {\n'
    result += `  border-color: ${style.colorButton}\n;`
    result += '}\n\n'

    if (widget.checked) {
      result += selector + '.qux-checkbox-checked .qux-checkbox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.checked, widget, this.cssFactory.borderColorProperties)
      result += '}\n\n'
    }

    return result
  }
}