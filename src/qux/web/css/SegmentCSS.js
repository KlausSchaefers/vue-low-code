import Logger from '../../core/Logger'

export default class SegmentCSS {

    constructor(cssFactory) {
        Logger.log(5, 'SegmentCSS()')
        this.cssFactory = cssFactory
        this.imagePrefix = cssFactory.imagePrefix
    }

    run (selector, style, widget) {
        let result = ''

        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += '}\n\n'

        result += selector + ' .qux-segment-item {\n'
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties)
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
        result += this.cssFactory.getBackGround(style, widget)
        result += `  border-left: none;\n`
        result += `  border-radius: 0px;\n`
        result += '}\n\n'


        result += selector + ' .qux-segment-item:first-child {\n'
        result += `  border-left-color: ${style._borderLeftColor};\n`
        let borderLeftStyle = style._borderLeftStyle ? style._borderLeftStyle : 'solid'
        result += `  border-left-style: ${borderLeftStyle};\n`
        result += `  border-left-width: ${style._borderLeftWidth}px;\n`
        if (style._borderTopLeftRadius) {
          result += `  border-top-left-radius: ${style._borderTopLeftRadius}px;\n`
        }
        if (style._borderBottomLeftRadius) {
          result += `  border-bottom-left-radius: ${style._borderBottomLeftRadius}px;\n`
        }
        result += '}\n\n'


        result += selector + ' .qux-segment-item:last-child {\n'
        if (style._borderTopRightRadius) {
          result += `  border-top-right-radius: ${style._borderTopRightRadius}px;\n`
        }
        if (style._borderBottomRightRadius) {
          result += `  border-bottom-right-radius: ${style._borderBottomRightRadius}px;\n`
        }
        result += '}\n\n'


        if (widget.active) {
          let active = widget.active
          result += selector + ' .qux-segment-item.qux-segment-item-selected{\n'
          result += `  background:${active.background};\n`
          result += `  color:${active.color};\n`
          result += this.cssFactory.getStyleByKey(active, widget, this.cssFactory.borderColorProperties)
          result += '}\n\n'
        }

        return result
    }

}