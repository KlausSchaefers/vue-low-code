<template>
  <div class="qux-base">
      {{label}}
  </div>
</template>
<script>

import * as Util from '../core/ExportUtil'
import JSONPath from '../core/JSONPath'
import Logger from '../core/Logger'

export default {
  name: 'Base',
  props: {
      'model': {
        type: Object
      },
      'element' : {
        type: Object
      },
      'config': {
        type: Object
      },
      'value': {
          type: Object
      }
  },
  computed: {
      hasLink () {
        if (this.element && (this.element.lines && this.element.lines)) {
          let line = this.element.lines.find(l => this.isClick(l))
          if (line) {
            let box = Util.getBoxById(line.to, this.model)
            if (box.type === 'Screen') {
             return true
            }
          }
        }
        return false
      },
      link () {
        if (this.element && (this.element.lines && this.element.lines.length  === 1)) {
          let line = this.element.lines.find(l => this.isClick(l))
          if (line) {
            let box = Util.getBoxById(line.to, this.model)
            if (box.type === 'Screen') {
              let prefix = ''
              if (this.config && this.config.router && this.config.router.prefix) {
                prefix = this.config.router.prefix + '/'
              }
              return `#/${prefix}${box.name}.html`
            }
          }
        }
        return false
      },
      hasAction () {
        return this.element &&
              (this.element.actions && Object.values(this.element.actions).length > 0) || 
              (this.element.lines && this.element.lines.length > 0)
      },
      label () {
          if (this.element && this.element.props) {
              return this.element.props.label
          }
          return ''
      },
      cssClass () {
        let result = 'qux-element '
        if (this.element) {
          if (this.element.style && this.element.style.verticalAlign) {
            result += `qux-valign-${this.element.style.verticalAlign} `
          }
          if (this.hasAction) {
            result += `qux-action `
          }
          if (this.config.debug && this.config.debug.resize === true) {
            if (this.element.props && this.element.props.resize) {
              let resize = this.element.props.resize
              for (let direction in resize) {
                if (resize[direction]) {
                     result += `qux-resize-${direction} `
                }
              }
            }
          }
          result += this.element.cssClass
        }
        return result
      },
      dataBindingInput () {
        if (this.element && this.element.props && this.element.props.databinding) {
          let path =  this.element.props.databinding.default
          let value = JSONPath.get(this.value, path)
          Logger.log(6, '_Base.dataBindingInput() > ' + path, `"${value}"`)
          return value
        }
        return null
      },
      dataBindingInputPath () {
        if (this.element && this.element.props && this.element.props.databinding) {
          let path =  this.element.props.databinding.default
          return path
        }
        return ''
      },
      dataBindingOutputPath () {
        if (this.element && this.element.props && this.element.props.databinding) {
          let path =  this.element.props.databinding.output
          return path
        }
        return ''
      },
      dataBindingLabel () {
        if (this.hasDataBinding) {
          let value = this.dataBindingInput
          if (value !== undefined && value != null) {
            Logger.log(6, '_Base.dataBindingLabel() > ',`"${value}"`)
            return value
          }
        }
        if (this.element && this.element.props) {
            return this.element.props.label
        }
        return ''
      }
  },
  watch: {
    value (v) {
      Logger.log(1, '_Base.watch(value) > enter', v)
      this.value = v
    }
  },
  methods: {
    isClick (line) {
      return line.event = 'click'
    },
    onClick (e) {
      this.$emit('qClick', this.element, e)
    },
    onChange (e) {
      this.$emit('qChange', this.element, e)
    },
    onKeyPress (e) {
      this.$emit('qKeyPress', this.element, e)
    },
    onFocus (e) {
      this.$emit('qFocus', this.element, e)
    },
    onBlur (e) {
      this.$emit('qBlur', this.element, e)
    },
    onMouseOver (e) {
      this.$emit('qMouseOver', this.element, e)
    },
    onMouseOut (e) {
      this.$emit('qMouseOut', this.element, e)
    },
    onValueChange (value, key = 'default') {
      if (this.element && this.element.props && this.element.props.databinding) {
        let path =  this.element.props.databinding[key]
        if (path) {
          Logger.log(3, '_Base.onValueChange() > change : ' + path, value)
          JSONPath.set(this.value, path, value)
        }
      }
    },
    hasDataBinding () {
      return this.element && this.element.props && this.element.props.databinding
    }
  }
}
</script>
