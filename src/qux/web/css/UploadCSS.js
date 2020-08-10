import Logger from '../../core/Logger'

export default class UploadCSS {

    constructor(cssFactory) {
        Logger.log(5, 'UploadCSS()')
        this.cssFactory = cssFactory
        this.imagePrefix = cssFactory.imagePrefix
    }

    run (selector, style, widget) {
        let result = ''

        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += this.cssFactory.getRawStyle(style, widget);
        result += '}\n\n'

        if (widget.hover) {
          let hover = widget.hover
          result += selector + ':hover {\n'
          result += `  background:${hover.background};\n`
          result += `  color:${hover.color};\n`
          result += this.cssFactory.getStyleByKey(hover, widget, this.cssFactory.borderColorProperties)
          result += '}\n\n'
        }

        if (widget.active) {
          let active = widget.active
          result += selector + '.qux-upload-has-files {\n'
          result += `  background:${active.background};\n`
          result += `  color:${active.color};\n`
          result += this.cssFactory.getStyleByKey(active, widget, this.cssFactory.borderColorProperties)
          result += '}\n\n'
        }

        return result
    }

}