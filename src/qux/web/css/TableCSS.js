import Logger from '../../core/Logger'

export default class TableCSS {

    constructor(cssFactory) {
        Logger.log(5, 'TableCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        let borderStyle = this.getTableBorderStyle(widget)

        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties)

        if (borderStyle === 'Out') {
            result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
        }
        result += '}\n\n'

        result += selector + ' .qux-table-action,'
        result += selector + ' .qux-table-cell{\n'
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.paddingProperties)
        result += '}\n\n'


        if (borderStyle === 'Cell') {
            result += selector + ' th,'
            result += selector + ' td{\n'
            result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
            result += '}\n\n'
        }

        if (borderStyle === 'VLines') {
            result += selector + ' th,'
            result += selector + ' td{\n'
            result += `  border-right-color:${style._borderBottomColor};\n`
            result += `  border-right-width:${style._borderBottomWidth}px;\n`
            result += `  border-right-style:solid;\n`
            result += '}\n\n'

            result += selector + ' th:last-child,'
            result += selector + ' td:last-Child{\n'
            result += `  border:none;\n`
            result += '}\n\n'
        }

        if (borderStyle === 'HLines') {
            result += selector + ' th,'
            result += selector + ' td{\n'
            result += `  border-bottom-color:${style._borderBottomColor};\n`
            result += `  border-bottom-width:${style._borderBottomWidth}px;\n`
            result += `  border-bottom-style:solid;\n`
            result += '}\n\n'

            result += selector + ' tr:last-child th,'
            result += selector + ' tr:last-Child td{\n'
            result += `  border:none;\n`
            result += '}\n\n'
        }

        result += selector + ' thead tr{\n'
        result += `  background:${style.headerBackground};\n`
        result += `  color:${style.headerColor};\n`
        if (style.headerFontStyle) {
            result += `  font-style:${style.headerFontStyle};\n`
        }
        if (style.headerFontWeight) {
            result += `  font-weight:${style.headerFontWeight};\n`
        }
        if (style.headerTextDecoration) {
            result += `  text-decoration:${style.headerTextDecoration};\n`
        }
        result += '}\n\n'

        result += selector + ' tbody tr:nth-child(2){\n'
        result += `  background:${style.evenRowBackground};\n`
        result += `  color:${style.evenRowColor};\n`
        result += '}\n\n'

        result += selector + ' tbody tr:hover{\n'
        if (style.hoverBackground) {
            result += `  background:${style.hoverBackground};\n`
        }
        if (style.hoverColor) {
            result += `  color:${style.hoverColor};\n`
        }
        result += '}\n\n'

        if (widget.props.tableActions) {
            widget.props.tableActions.forEach((action, i) => {
                result += selector + ' .qux-table-action-cntr .qux-table-action-' + i + '{\n'
                if (action.color) {
                    result += `  color:${action.color};\n`
                }
                result += '}\n\n'
            })
        }

        if (style.checkBox) {
            result += selector + ' .qux-checkbox-cntr{\n'
            let s = style.checkBoxSize ? style.checkBoxSize : style.fontSize
            result += `  width:${s}px;\n`
            result += `  height:${s}px;\n`
            result += `  background:${style.checkBoxBackground};\n`
            result += `  border-color:${style.checkBoxBorderColor};\n`
            result += `  border-radius:${style.checkBoxBorderRadius}px;\n`
            result += `  border-width:${style.borderWidth}px;\n`

            result += '}\n\n'

            result += selector + ' .qux-checkbox-hook {\n'
            result += `  border-color:${style.checkBoxHookColor};\n`
            result += '}\n\n'
        }

        let widths = this.getTableWidths(widget.props, style)
        widths.forEach((w, i) => {
            result += selector + ' .qux-table-column-' + i + '{\n'
            result += `  width:${Math.round(w * widget.w)}px;\n`
            result += '}\n\n'
        })
        //widths.forEach((w,i) => {
        //  result += selector + ' td:nth-child(' + (i +1 ) + '){\n'
        //  result += `  width:${Math.round(w * widget.w)}px;\n`
        //  result += '}\n\n'
        //})
        return result
    }

    getTableWidths(props, style, fontFactor = 0.6) {
        var result = [];
        if (props.widths) {
            let widths = props.widths

            var sum = 0;
            let padding = style._paddingLeft + style._paddingRight
            if (style.checkBox) {
                let w = style.checkBoxSize ? style.checkBoxSize : style.fontSize
                widths = [w + padding].concat(widths);
            }
            if (props.tableActions && props.tableActions.length > 0) {
                let text = props.tableActions.map(a => a.label).join()
                let w = text.length * style.fontSize * fontFactor + padding * props.tableActions.length
                widths = widths.concat(w)
            }
            for (let i = 0; i < widths.length; i++) {
                sum += widths[i];
            }
            for (let i = 0; i < widths.length; i++) {
                result[i] = widths[i] / sum;
            }
        }
        return result;
    }


    getTableBorderStyle(model) {
        if (model.props.borderStyle) {
            return model.props.borderStyle;
        }
        return "Cell";
    }
}