import Logger from '../../core/Logger'

export default class ChartCSS {

    constructor(cssFactory) {
        Logger.log(5, 'ChartCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
        result += '}\n\n'
        return result
    }
}