import Logger from '../../core/Logger'
import * as Util from '../../core/ExportUtil'

export default class VectorCSS {

    constructor(cssFactory) {
        Logger.log(5, 'VectorCSS()')
        this.cssFactory = cssFactory
        this.imagePrefix = cssFactory.imagePrefix
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);

        if (Util.isFixedHorizontal(widget)) {
          result += `  width:${this.cssFactory.getCorrectedWidth(widget)};\n`
          result += `  height:${this.cssFactory.getCorrectedHeight(widget)};\n`
        }

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