import Logger from '../../core/Logger'

export default class VectorCSS {

    constructor(cssFactory) {
        Logger.log(5, 'VectorCSS()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);

        // FIXME: make this smarter?
        result += `  height:${this.cssFactory.getCorrectedHeight(widget)};\n`
        result += `  width:${this.cssFactory.getCorrectedWidth(widget)};\n`

        if (style.backgroundImage && style.backgroundImage.url) {
          if (style.backgroundImage.url.indexOf('http') === 0) {
            result += `  background-image: url(${style.backgroundImage.url});\n`
          } else {
            result += `  background-image: url(${this.imagePrefix}/${style.backgroundImage.url});\n`
          }
        }
        result += '}\n\n'
        return result
    }

}