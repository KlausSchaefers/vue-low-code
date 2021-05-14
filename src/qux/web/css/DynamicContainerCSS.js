import Logger from '../../core/Logger'

export default class DynamicContainerCSS {

    constructor(cssFactory) {
        Logger.log(5, 'DynamicContainerCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += '}\n\n'
        return result
    }
}