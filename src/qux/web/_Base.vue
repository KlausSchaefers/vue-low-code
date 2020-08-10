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
      },
      'lbl': {
        type: String
      }
  },
  computed: {
      hasLink () {
        if (this.element && (this.element.lines && this.element.lines)) {
          let line = this.element.lines.find(l => this.isClick(l))
          if (line) {
            let box = Util.getBoxById(line.to, this.model)
            if (box.type === 'Screen' && !box.style.overlay) {
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
              (this.element.lines && this.element.lines.length > 0) ||
              (this.element.props.callbacks && this.element.props.callbacks.click)
      },
      label () {
          if (this.element && this.element.props && this.element.props.label) {
            return this.escapeLabel(this.element.props.label)
          }
          if (this.lbl) {
            return this.lbl
          }
          return ''
      },
      cssClass () {
        let result = 'qux-element '
        if (this.element) {
          /**
           * FIXME: Move this to CSSFactory
           */
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

          if (this.element.sharedCssClasses){
            result += this.element.sharedCssClasses.join(' ') + ' '
          }
          result += this.element.cssClass
        }
        return result
      },
      dataBinding () {
        if (this.element && this.element.props && this.element.props.databinding) {
          return this.element.props.databinding
        }
        return null
      },
      dataBindingInput () {
        if (this.element && this.element.props && this.element.props.databinding) {
          let path =  this.element.props.databinding.default
          if (path) {
            let value = JSONPath.get(this.value, path)
            Logger.log(5, '_Base.dataBindingInput() > ' + path, `"${value}"`)
            return value
          }
        }
        return null
      },
      dataBindingOptions () {
        if (this.element && this.element.props && this.element.props.databinding) {
          let path =  this.element.props.databinding.options
          if (path) {
            let value = JSONPath.get(this.value, path)
            Logger.log(5, '_Base.dataBindingOptions() > ' + path, `"${value}"`)
            return value
          }
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
        if (this.element && this.element.props && this.element.props.label) {
            return this.escapeLabel(this.element.props.label)
        }
        return ''
      },
      hasError () {
        return false
      },
      options () {
        let dataBindingOptions = this.dataBindingOptions
        if (dataBindingOptions) {
            return dataBindingOptions
        }
        if (this.element && this.element.props && this.element.props.options){
          return this.element.props.options
        }
        return []
      }
  },
  watch: {
    value (v) {
      Logger.log(3, '_Base.watch(value) > enter', v)
      this.value = v
    }
  },
  methods: {
    escapeLabel (lbl) {
      lbl = lbl.replace(/&nbsp;/ig, ' ')
      return lbl
    },
    isClick (line) {
      return line.event = 'click'
    },
    hasDataBinding () {
      return this.element && this.element.props && this.element.props.databinding
    },
    /**
     * Default event handlers which just delegate up
     * the hierachy
     */
    onClick (e) {
      this.$emit('qClick', this.element, e, this.getValue())
    },
    onChange (e) {
      this.$emit('qChange', this.element, e, this.getValue())
    },
    onKeyPress (e) {
      this.$emit('qKeyPress', this.element, e, this.getValue())
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
    /**
     * Template method which can be implemnted by children to
     * give the current value to the onChange
     */
    getValue () {
      return this.dataBindingInput
    },
    /**
     * Method wich sets the value accoridng to the dataBing path.
     */
    onValueChange (value, key = 'default', e) {
      if (this.element && this.element.props && this.element.props.databinding) {
        let path =  this.element.props.databinding[key]
        if (path) {
          Logger.log(3, '_Base.onValueChange() > change : ' + path, value)
          JSONPath.set(this.value, path, value)
        }
      }
      /**
       * We also trigger the change event
       */
      this.$emit('qChange', this.element, e, value)
    }
  }
}
</script>
