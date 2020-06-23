<template>
  <div class="qux">
  </div>
</template>
<script>
import Logger from '../core/Logger'
import RestEngine from '../core/RestEngine'
import JSONPath from '../core/JSONPath'
import * as ExportUtil from '../core/ExportUtil'

export default {
  name: 'Logic',
  methods: {

    async executeRest (widget) {
        Logger.log(0, 'QUX.executeRest() > enter', widget.props.rest)

        let rest = widget.props.rest

        /**
         * get al the data we need!
         */
        let requiredDataBindings = RestEngine.getNeededDataBings(rest)
        let data = {}
        requiredDataBindings.forEach(path => {
            let value = JSONPath.get(this.value, path)
            data[path] = value
        })

        /**
         * Call rest
         */
        let success = await this.runRestEngine(rest, data)

        /**
         * Find next line to execute
         */
        let lines = ExportUtil.getLines(widget, this.model)
        let nextLine = this.getRuleMatchingLine(lines, success)
        if (nextLine) {
          this.executeLine(nextLine)
        }
    },

    async runRestEngine (rest, data) {
      try {
        let result = await RestEngine.run(rest, data)
        Logger.log(1, "QUX.executeRest","set data " + rest.output.databinding, result);
        if (rest.output.databinding) {
            JSONPath.set(this.value, rest.output.databinding, result)
        }
        return true
      } catch (e) {
        Logger.error("QUX.executeRest","error", e);
        if (rest.output.databinding) {
            JSONPath.set(this.value, rest.output.databinding, 'Error')
        }
      }
      return false
    },

    getRuleMatchingLine (lines, restSuccess) {
        let matchedLine;
        for(var i=0; i< lines.length; i++){
            var line = lines[i];
            if(line.rule){
                if (line.rule.type === 'widget') {
                    Logger.error('QUX.getRuleMatchingLine() > widget ruels not supported in low code')
                }
                if (line.rule.type === 'databinding') {
                    matchedLine = this.checkDataBindingRule(line)
                }
                if (line.rule.type === 'rest') {
                    if (line.rule.restResponseStatus === '4xx' && !restSuccess) {
                        matchedLine = line
                    }
                    if (line.rule.restResponseStatus === '200' && restSuccess) {
                        matchedLine = line
                    }
                }
                if (matchedLine) {
                    break;
                }
            } else {
                /**
                 * The *FIRST* line without a condition will be
                 */
                if(!matchedLine){
                    matchedLine = line;
                }
            }
        }
        return matchedLine;
    },

    checkDataBindingRule (line) {
        let rule = line.rule
        let value = JSONPath.get(rule.databinding, this.value)
        var result = this.isValueMatchingRule(value, true, rule);
        if (result) {
          return line
        }
    },

		isValueMatchingRule (value, valid, rule) {
			Logger.log(2,"QUX.isValueMatchingRule","enter > " + rule.value + " " + rule.operator + " " + value + " / " + valid);

			var operator = rule.operator;
      /**
       * Special handling for checkbox group.
       * We should have an "in" operation
       */
      if (value && Array.isArray(value) && value.length > 0){
        value = value[0]
      }

      var result = false;
      switch(operator){
        case "contains":
          if (value.toLowerCase && rule.value.toLowerCase) {
            var lowerValue = value.toLowerCase();
            var lowerRule = rule.value.toLowerCase();
            result = lowerValue.indexOf(lowerRule) >= 0;
          } else {
            result = false;
          }
            break;
        case "isValid":
          result = valid;
            break;
        case "checked":
          result = (value === true);
            break;
        case "notchecked":
          result = (value === false);
              break;

          case "active":
            result = (value === true);
              break;
          case "notactive":
            result = (value === false);
              break;
          case "==":
            result = (value === rule.value);
              break;
          case "!=":
            result = (value != rule.value);
              break;
          case ">":
            if(!value){
              value = 0;
            }
            result = (value*1 > rule.value *1);
              break;
          case "<":
            if(!value){
              value = 0;
            }
            result = (value*1 < rule.value *1);
              break;
          case ">=":
            if(!value){
              value = 0;
            }
            result = (value*1 >= rule.value *1);
              break;
          case "<=":
            if(!value){
              value = 0;
            }
            result = (value*1 <= rule.value *1);
              break;
          default:
            Logger.warn('QUX.isValueMatchingRule() Not supported operator')
      }
      return result;
		}
  }
}
</script>
