import Logger from '../../core/Logger'

export default class ImageCSS {

    constructor(cssFactory) {
        Logger.log(5, 'ImageCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        if (widget.style.backgroundImage) {
          result += this.cssFactory.getRawStyle(widget.style, widget);
        } else {
          Logger.log(5, 'ImageCSS.run()', 'No background for image > ' + widget.name)
          result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
          if (widget?.has?.iconPlaceholder) {
              const s = Math.round(Math.min(widget.w, widget.h) * 0.3)
              result += `  font-size: ${s}px;\n`;
          } else {
            result += `  background-image:${this.getImagePlaceHolder(widget)};\n`
            result += `  background-size: 100% 100%;\n`
            result += `  border: 1px solid #333;\n`
          } 
        }
        result += '}\n\n'

        return result
    }

    getImagePlaceHolder (widget) {
      try {
        var w = widget.w * 2;
        var h = widget.h * 2;
        var c = document.createElement("canvas");
        var context = c.getContext("2d");
        c.width = w;
        c.height = h;
        h += 0.5;
        w += 0.5;
        var n = 0.5;
        context.moveTo(n, n);
        context.lineTo(w, h);
        context.moveTo(w, n);
        context.lineTo(n, h);
        context.strokeStyle = "#333";
        context.strokeWidth = 2;
        context.imageSmoothingEnabled = false;
        context.stroke();
        let url = 'url(' + c.toDataURL("image/png") + ')';
        return url
      } catch (err) {
        /**
         * can happen in jest
         */
        Logger.log(5, 'ImageCSS.getImagePlaceHolder() error',)
      }

    }
}