import Logger from '../../core/Logger'
import * as Util from '../../core/ExportUtil'

export default class RepeaterCSS {

    constructor(cssFactory) {
        Logger.log(5, 'RepeaterCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
      let result = ''
      result += selector + ' {\n'
      result += this.cssFactory.getRawStyle(style, widget);
      /**
       * Set here somehow justify-content
       */
      result += this.cssFactory.getPosition(widget);
      result += '}\n\n'

      /**
       * We might habve here some weird conditions
       *
       * a) Row
       * b) Grid
       *  1) Auto => Wrapped
       *  2) Fixed margin
       */

      if (Util.isWrappedContainer(widget)) {
        Logger.warn('RepeaterCSS.run () > wrapped container not supported', widget)
      }

      let boundingBox = Util.getBoundingBoxByBoxes(widget.children)
      boundingBox.parent = widget

      if (Util.isRepeaterGrid(widget)) {
        Logger.log(5, 'RepeaterCSS.run () > grid', widget)
        result += selector + ' .qux-repeater-child {\n'
        result += '  display: inline-block;\n';
        let width = this.cssFactory.getWrappedWidth(boundingBox)
        result += `  width: ${width};\n`;
        let height = this.cssFactory.getFixedHeight(boundingBox)
        result += `  height: ${height};\n`;
        result += `  margin-bottom:${widget.props.distanceY}px;\n`;
        if (!Util.isRepeaterAuto(widget)) {
          result += `  margin-right:${widget.props.distanceX}px;\n`;
        }
        if (boundingBox.x > 0) {
          result += `  margin-left:${boundingBox.x}px;\n`;
        }
        if (boundingBox.y > 0) {
          result += `  margin-top:${boundingBox.y}px;\n`;
        }
        result += '}\n\n'
      }  else {
        Logger.log(5, 'RepeaterCSS.run () > row', widget)
        /**
         * Row
         */
        result += selector + ' .qux-repeater-child {\n'
        result += `  margin-bottom:${widget.props.distanceY}px;\n`;
        result += '}\n\n'
      }

      return result
    }
}