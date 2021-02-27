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
      result += this.cssFactory.getPosition(widget);
      result += '}\n\n'

      if (Util.isWrappedContainer(widget)) {
        Logger.warn('RepeaterCSS.run () > wrapped container not supported', widget)
      }

      /**
       * If we have just one child, we just take this to male sure we use teh min and max width
       */
      let boundingBox = widget.children.length === 1 ? widget.children[0]: Util.getBoundingBoxByBoxes(widget.children)
      boundingBox.parent = widget

      result += selector + ' .qux-repeater-child {\n'
      if (Util.isLayoutAuto(widget)) {
        result += this.getChildrenAuto(selector, widget, boundingBox)
      } else if (Util.isRepeaterGrid(widget)) {
        result += this.getChildrenGrid(selector, widget, boundingBox)
      }  else {
        result += this.getChildrenRow(selector, widget, boundingBox)
      }

      result += '}\n\n'

      return result
    }

    getChildrenAuto(selector, widget, boundingBox) {
      Logger.log(3, 'RepeaterCSS.getChildrenAuto () > ', widget, boundingBox)
      let result = ''
      let height = this.cssFactory.getFixedHeight(boundingBox)
      result += `  height: ${height};\n`;
      result += this.cssFactory.getWrappedWidth(boundingBox);
      return result
    }

    getChildrenRow (selector, widget, boundingBox) {
      Logger.log(3, 'RepeaterCSS.getChildrenRow () > ', widget)
      let result = ''

      result += this.cssFactory.getWrappedWidth(boundingBox);
      result += `  margin-bottom:${widget.props.distanceY}px;\n`;

      if (boundingBox.x > 0) {
        result += `  margin-left:${boundingBox.x}px;\n`;
      }
      if (boundingBox.y > 0) {
        result += `  margin-top:${boundingBox.y}px;\n`;
      }

      return result
    }

    getChildrenGrid (selector, widget, boundingBox) {
      Logger.log(5, 'RepeaterCSS.getChildrenGrid () > grid', widget)
      let result =''

      result += '  display: inline-block;\n';
      result += this.cssFactory.getWrappedWidth(boundingBox);
      let height = this.cssFactory.getFixedHeight(boundingBox)
      result += `  height: ${height};\n`;
      if (!Util.isRepeaterAuto(widget)) {
        result += `  margin-bottom:${widget.props.distanceY}px;\n`;
        result += `  margin-right:${widget.props.distanceX}px;\n`;
      } else {
        /**
         * The last elements should not have a margin...
         */
        let rows = Math.floor(widget.h / boundingBox.h)
        let distance = (widget.h - (boundingBox.h * rows)) / (rows - 1)
        result += `  margin-bottom:${distance}px;\n`;
      }
      if (boundingBox.x > 0) {
        result += `  margin-left:${boundingBox.x}px;\n`;
      }
      if (boundingBox.y > 0) {
        result += `  margin-top:${boundingBox.y}px;\n`;
      }

      return result
    }
}