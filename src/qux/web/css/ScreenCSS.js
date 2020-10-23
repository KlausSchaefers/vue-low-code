import Logger from '../../core/Logger'
import * as Util from '../../core/ExportUtil'

export default class ScreenCSS {

    constructor(cssFactory) {
        Logger.log(5, 'ScreenCSS.constructor()')
        this.cssFactory = cssFactory
        this.imagePrefix = cssFactory.imagePrefix
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        if (!Util.isOverlay(widget) || Util.hasOverlayBackground(widget)) {
            if (style.background) {
                if (style.background.colors) {
                    let background = style.background
                    let gradient = "(" + background.direction + "deg";
                    for (var i = 0; i < background.colors.length; i++) {
                        var color = background.colors[i];
                        gradient += "," + color.c + " " + color.p + "% ";
                    }
                    gradient += ")";
                    result += `  background: linear-gradient${gradient};\n`
                } else {
                    result += `  background-color: ${style.background};\n`
                }
            }
            if (style.backgroundColor) {
                result += `  background-color: ${style.backgroundColor};\n`
            }
            if (style.backgroundImage && style.backgroundImage.url) {
                if (style.backgroundImage.url.indexOf('http') === 0) {
                  result += `  background-image: url(${style.backgroundImage.url});\n`
                } else {
                  result += `  background-image: url(${this.imagePrefix}/${style.backgroundImage.url});\n`
                }
            }
        }
        result += this.cssFactory.getPosition(widget);

        /**
         * Check if we have full screen (height = 100%) or fixed size, component
         */
        if (widget.isComponentScreen) {
            result += `  height:${widget.h}px;\n`
            result += `  width:${widget.w}px;\n`
            result += this.cssFactory.getStyleByKey(style, widget, ['boxShadow'])
            result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
        } else {
            result += '  height:100%;\n'
        }

        result += '}\n\n'
        return result
    }

}