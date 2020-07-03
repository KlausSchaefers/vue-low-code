import Logger from '../../core/Logger'

export default class VectorCSS {

    constructor(cssFactory) {
        Logger.log(5, 'Timeline()')
        this.cssFactory = cssFactory
        this.imagePrefix = cssFactory.imagePrefix
    }

    run (selector, style, widget) {
      let result = ''
      result += selector + ' {\n'
      result += this.cssFactory.getPosition(widget);
      if (style.elementSpacing === -1) {
        result += `  display:flex;\n`
        result += `  flex-direction: column;\n`
        result += `  justify-content: space-around;\n`
      }
      result += '}\n\n'

      let circleSize = style.circleSize - style.circleBorderWidth
      let left = (circleSize - style.lineWidth) / 2 + 1

      result += selector + ' .qux-timeline-line{\n'
      result += `  background:${style.lineBackground};\n`
      result += `  width:${style.lineWidth}px;\n`
      result += `  border-radius:${Math.round(style.lineWidth / 2)}px;\n`
      result += `  left:${Math.round(left)}px;\n`
      result += '}\n\n'

      if (style.elementSpacing > 0) {
        result += selector + ' .qux-timeline-element{\n'
        result += `  margin-top:${style.elementSpacing}px;\n`
        result += '}\n\n'
      }


      result += selector + ' .qux-timeline-element-selected .qux-timeline-circle{\n'
      result += `  background:${style.cicleActiveBackground};\n`
      result += `  border-color:${style.cicleActiveBorderColor};\n`
      result += '}\n\n'


      result += selector + ' .qux-timeline-element-selected .qux-timeline-label{\n'
      result += `  color:${style.cicleActiveTextColor};\n`
      result += '}\n\n'

      result += selector + ' .qux-timeline-label{\n'
      result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties)
      result += '}\n\n'


      result += selector + ' .qux-timeline-circle{\n'
      result += `  background:${style.cicleBackground};\n`
      result += `  width:${circleSize}px;\n`
      result += `  height:${circleSize}px;\n`
      result += `  border-color:${style.cicleBorderColor};\n`
      result += `  border-width:${style.circleBorderWidth}px;\n`
      result += '}\n\n'

      return result
    }

}

/**
 *  "lineWidth": 8,
      "lineBackground": "#333333",
      "lineBorderColor": "#ffffff",
      "lineBorderWidth": 0,
      "circleSize": 32,
      "cicleBackground": "#ffffff",
      "cicleBorderColor": "#333333",
      "circleBorderWidth": 2,
      "elementSpacing": -1,
      "cicleActiveBackground": "#cccccc",
      "cicleActiveTextColor": "#cccccc",
      "cicleActiveBorderColor": "#333333"
 */