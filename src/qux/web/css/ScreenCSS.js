import Logger from '../../core/Logger'
import * as Util from '../../core/ExportUtil'

export default class ScreenCSS {

    constructor(cssFactory) {
        Logger.log(5, 'ScreenCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        if (!Util.isOverlay(widget) || Util.hasOverlayBackground(widget)) {
          result += `  background:${style.background};\n`
        }
        result += '  height:100%;\n'
        result += '}\n\n'

        return result
    }

}