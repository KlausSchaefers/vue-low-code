import Logger from '../../core/Logger'

export default class SpinnerCSS {

    constructor(cssFactory) {
        Logger.log(5, 'SpinnerCSS()')
        this.cssFactory = cssFactory
        this.imagePrefix = cssFactory.imagePrefix
    }

    run (selector, style, widget) {
        let result = ''

        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties)
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
        result += '}\n\n'

        if (widget.hover) {
          let hover = widget.hover
          result += selector + ':hover {\n'
          result += `  color:${hover.color};\n`
          result += '}\n\n'
        }

        result += selector + ' .qux-spinner-option-cntr {\n'
        result += `  height:${Math.ceil(widget.h * 3)}px;\n`
        result += '}\n\n'

        result += selector + ' .qux-spinner-option {\n'
        result += `  height:${Math.floor(widget.h / 3)}px;\n`
        result += '}\n\n'


        result += selector + ' .qux-spinner-border {\n'
        result += `  border-top-color:${style.borderBoxColor};\n`
        result += `  border-bottom-color:${style.borderBoxColor};\n`
        result += '}\n\n'

        return result
    }

}