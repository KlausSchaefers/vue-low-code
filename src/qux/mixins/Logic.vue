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

    executeLogic (widget, line) {
        Logger.log(0, 'Luisa.executeLogic() > enter', widget.props, line)

        let lines = ExportUtil.getLines(widget, this.model)
				var nextLine = null;

				if (widget.props && widget.props.isRandom){
						var random = Math.random()
						var pos = Math.floor(random * lines.length);
						Logger.log(0,"Luisa.executeLogic","enter >  do AB:" + widget.id + " >> " + random + " >> " + pos);
						nextLine = lines[pos]
				} else {
						nextLine = this.getRuleMatchingLine(lines)
        }

        if (nextLine) {
          this.executeLine(nextLine)
        } else {
          /**
           * THis can happs as a modelling error!
           */
          Logger.warn('Luisa.executeLogic() > NO RULE matching',lines)
        }
    },

    async executeRest (widget) {
        Logger.log(0, 'Luisa.executeRest() > enter', widget.props.rest)

        let rest = widget.props.rest

        /**
         * get al the data we need!
         */
        let requiredDataBindings = RestEngine.getNeededDataBings(rest)
        let data = {}
        requiredDataBindings.forEach(path => {
            let value = JSONPath.get(this.modelValue, path)
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
        }  else {
          Logger.warn('Luisa.executeRest() > NO RULE matching',lines)
        }
    },

    async runRestEngine (rest, data) {
      try {
        let result = await RestEngine.run(rest, data)
        Logger.log(1, "Luisa.executeRest","set data " + rest.output.databinding, result);
        if (rest.output.databinding) {
            JSONPath.set(this.modelValue, rest.output.databinding, result)
        }
        return true
      } catch (e) {
        Logger.error("Luisa.executeRest","error", e);
        if (rest.output.databinding) {
            JSONPath.set(this.modelValue, rest.output.databinding, 'Error')
        }
      }
      return false
    },

    getRuleMatchingLine (lines, restSuccess) {
        let matchedLine;
        for(var i=0; i< lines.length; i++){
            var line = lines[i];
            if (line.rule){
                Logger.log(4, 'Luisa.getRuleMatchingLine() > check', i, line.rule)
                if (line.rule.type === 'widget') {
                    Logger.error('Luisa.getRuleMatchingLine() > widget rules not supported in low code')
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
        Logger.log(4, 'Luisa.checkDataBindingRule() > enter', line.rule.databinding);
        let rule = line.rule
        let value = JSONPath.get(this.modelValue, rule.databinding)
        var result = this.isValueMatchingRule(value, true, rule);
        if (result) {
          Logger.log(-1, 'Luisa.checkDataBindingRule() > match!', line);
          return line
        }
    },

		isValueMatchingRule (value, valid, rule) {
			Logger.log(3, 'Luisa.isValueMatchingRule() > enter > ' + rule.value + ' ' + rule.operator + ' >' + value + '< / ' + valid);

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

        case "==":
          result = (value == rule.value);
          break;

        case "!=":
          if (rule.value === null || rule.value === undefined) {
            result = value !== null && value !== undefined && value !== ''
          } else {
            result = (value != rule.value);
          }
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
          Logger.warn('Luisa.isValueMatchingRule() Not supported operator')
      }
      return result;
		}
  }
}
</script>
