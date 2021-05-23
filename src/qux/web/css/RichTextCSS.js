import Logger from '../../core/Logger'

export default class RichTextCSS {

    constructor(cssFactory) {
        Logger.log(5, 'RichTextCSS()')
        this.cssFactory = cssFactory
        this.imagePrefix = cssFactory.imagePrefix
    }

    run (selector, style, widget) {
        let result = ''

        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += this.cssFactory.getRawStyle(style, widget);
        result += '}\n\n'

        if (widget.props && widget.props.richTextLabel) {
          let richText = widget.props.richTextLabel
          richText.forEach((child, i) => {
            if (child.style) {
              result += selector + ` .qux-rich-text-child-${i} {\n`
              result += this.cssFactory.getRawStyle(child.style, widget)
              result += '}\n\n'
            }
          })
        }

        return result
    }

}