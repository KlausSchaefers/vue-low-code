import Logger from '../../core/Logger'
import * as Util from '../../core/ExportUtil'

export default class ComponentSetCSS {

    constructor(cssFactory) {
        Logger.log(5, 'ComponentSetCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {

        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += '}\n\n'


        /**
         * We also layout the childrem here
         */
        widget.children.forEach(child => {
          result += child.cssSelector +' {\n'
          if (Util.isFixedHorizontal(child)) {
            result += `  width: ${this.cssFactory.getCorrectedWidth(child, true)};\n`
          } else if (Util.hasMinMaxWdith(child)) {
            result += this.getMinMaxWidth(child, false)
          }else {
            result += `  min-width: ${this.cssFactory.getCorrectedWidth(child, true)};\n`
          }

          if (Util.isFixedVertical(child)) {
            result += `  height: ${this.cssFactory.getCorrectedHeight(child, true)};\n`
          } else {
            result += `  min-height: ${this.cssFactory.getCorrectedHeight(child, true)};\n`
          }

          result += '}\n\n'
        })

        return result
    }
}