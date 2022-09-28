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
      },
      'url': {
        type: String
      },
      'optionList': {
        type: Array
      },
      'isStandAlone': {
        type: Boolean
      }
  },
  data: function () {
      return {
        hasLabelInOptions: true
      }
  },
  computed: {
      isDesignSystemRoot () {
        return this.element && this.element.isDesignSystemRoot
      },
      hasSlot () {
        return this.$slots.default !== undefined && this.$slots.default !== null
      },
      hasLink () {
        if (this.url && this.url.length > 0) {
          return true
        }
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
      hasHistoryRouter () {
        return this.$router && this.$router.mode === 'history'
      },
      link () {
        if (this.url) {
          return this.url
        }
        if (this.element && (this.element.lines && this.element.lines.length  === 1)) {
          let line = this.element.lines.find(l => this.isClick(l))
          if (line) {
            let box = Util.getBoxById(line.to, this.model)
            if (box.type === 'Screen') {
              let prefix = ''
              if (this.config && this.config.router && this.config.router.prefix) {
                prefix = this.config.router.prefix + '/'
              }
              if (this.config && this.config.router && this.config.router.routerLinkPrefix) {
                prefix = this.config.router.routerLinkPrefix + '/'
              }
              return `${prefix}${box.name}.html`
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
        if (this.lbl) {
          return this.lbl
        }
        if (this.dataBindingInputPath && this.dataBindingInputPath.indexOf('$') === 0) {
          let dsRoot = this.getDesignSystemRoot()
          let path = this.dataBindingInputPath.substring(1)
          if (dsRoot) {
            if (dsRoot[path]) {
              return dsRoot[path]
            }
          }
        }
        if (this.element && this.element.props && this.element.props.label) {
          return this.escapeLabel(this.element.props.label)
        }
        return ''
      },
      cssComponentClasses () {
        if (this.element && this.element.cssComponentClasses) {
          return this.element.cssComponentClasses.join(' ')
        }
        return ''
      },
      cssClass () {
        let result = 'qux-element '
        if (this.element) {
          /**
           * FIXME: Move this to CSSFactory
           */
          if (this.element.children && this.element.children.length === 0) {
            if (this.element.style && this.element.style.verticalAlign) {
              result += `qux-valign-${this.element.style.verticalAlign} `
            }
          }
          if (this.hasAction) {
            result += `qux-action `
          }
          if (this.config && this.config.debug && this.config.debug.resize === true) {
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
        /**
         * First, cgeck if we have set a lbl property
         */
        if (this.lbl) {
          return this.lbl
        }
        /**
         * Next, check data binding
         */
        if (this.hasDataBinding) {
          /**
           * Check if we have a magic property path like $label
           */
          if (this.dataBindingInputPath && this.dataBindingInputPath.indexOf('$') === 0) {
            Logger.log(4, '_Base.dataBindingLabel() > props : ',`"${this.dataBindingInputPath}"`)
            let dsRoot = this.getDesignSystemRoot()
            if (dsRoot) {
              let path = this.dataBindingInputPath.substring(1)
              if (dsRoot[path]) {
                return dsRoot[path]
              }
            }
          } else {
            /**
             * If not magic, check if there is a variable
             */
            let value = this.dataBindingInput
            if (value !== undefined && value != null) {
              Logger.log(6, '_Base.dataBindingLabel() > ',`"${value}"`)
              return value
            }
          }
        }
        /**
         * Last, check element properties
         */
        if (this.element && this.element.props && this.element.props.label) {
            return this.escapeLabel(this.element.props.label)
        }
        return ''
      },
      hasError () {
        return false
      },
      options () {
        if (this.optionList) {
          return this.optionList
        }
        let dataBindingOptions = this.dataBindingOptions
        if (dataBindingOptions) {
            return dataBindingOptions
        }
        if (this.element && this.element.props && this.element.props.options){
          let options = this.element.props.options
          if (this.element.props.label && this.hasLabelInOptions) {
            options.unshift(this.element.props.label)
          }
          return options
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
    stopEvent (e) {
      Logger.warn('_Base.stopEvent()')
      if (e) {
        e.stopPropagation()
      }
    },

    getDesignSystemRoot () {
      let parent = this.$parent
      while (parent && parent.element && !parent.element.isDesignSystemRoot) {
        parent = parent.$parent
      }
      if (parent.element && parent.element.isDesignSystemRoot) {
        return parent
      }
    },

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
      this.$emit('click', e)
      this.checkDesignSystemCallback(e, 'click')
      this.fireParentDomEvent('click', e)
    },
    fireParentDomEvent(type, e) {
      /**
        * The wrapper stops our events, so we fire DOM event on parent
        */
      if (this.element && this.element.isDesignSystemRoot) {
        this.$parent.$emit(type, e)
      }
    },
    onChange (e) {
      this.$emit('qChange', this.element, e, this.getValue())
      this.checkDesignSystemCallback(e, 'change')
      this.fireParentDomEvent('change', e)
    },
    onKeyPress (e) {
      this.$emit('qKeyPress', this.element, e, this.getValue())
      this.checkDesignSystemCallback(e, 'change')
      this.fireParentDomEvent('keyPress', e)
    },
    onFocus (e) {
      this.$emit('qFocus', this.element, e)
      this.fireParentDomEvent('focus', e)
    },
    onBlur (e) {
      this.$emit('qBlur', this.element, e)
      this.fireParentDomEvent('blur', e)
    },
    onMouseOver (e) {
      this.$emit('qMouseOver', this.element, e)
    },
    onMouseOut (e) {
      this.$emit('qMouseOut', this.element, e)
    },

    checkDesignSystemCallback (e, type) {
      Logger.log(4, '_Base.checkDesignSystemCallback() > : ' + type, this.element)
      if (this.element && this.element.props && this.element.props.callbacks) {
        let callback = this.element.props.callbacks[type]
        if (callback) {
          Logger.log(1, '_Base.checkDesignSystemCallback() > : ' + this.element.name, type, callback)
          this.$emit('qDesignSystemCallback', this.element, e, type, callback, this.getValue())
          this.emitDesignSystemCallback()
        }
      }
    },

    forwardDesignSystemCallback (element, e, type, callback, elementValue) {
      Logger.log(5, '_Base.forwardDesignSystemCallback() > : ' + this.element.name, element.name)
      this.$emit('qDesignSystemCallback', element, e, type, callback, elementValue)
      this.emitDesignSystemCallback(element, e, type, callback, elementValue)
    },


    emitDesignSystemCallback (element, e, type, callback) {
      if (this.element.isDesignSystemRoot && this.$parent) {
        Logger.log(1, '_Base.emitDesignSystemCallback() > : ' + this.element.name, callback, this.value)
        /**
         * We have to call on parent, because
         * we have this virtual wrapper around.
         */
        this.$parent.$emit(callback, this.value, e)
      }
    },
    /**
     * Template method which can be implemnted by children to
     * give the current value to the onChange
     */
    getValue () {
      return this.dataBindingInput
    },
    /**
     * Method which sets the value accoridng to the dataBing path.
     */
    onValueChange (value, key = 'default', e, triggerChange = true) {
      Logger.log(3, '_Base.onValueChange() > change : ' + this.element.name, value)
      if (this.element && this.element.props && this.element.props.databinding) {
        let path =  this.element.props.databinding[key]
        if (path && this.value != undefined && this.value !== true && this.value !== false) {
          try {
            Logger.log(4, '_Base.onValueChange() > change : ' + path, value)
            JSONPath.set(this.value, path, value)
          } catch (ex) {
            Logger.error('_Base.onValueChange() > Could not set value in path' + path, this.value)
          }
          //Logger.log(-1, '_Base.onValueChange() > exit : ', JSON.stringify(this.value, null, 2))
        }
      }
    
      /**
       * We also trigger the change event
       */
      if (triggerChange) {
        this.$emit('qChange', this.element, e, value)
      }

      /**
       * For design system roots, we also fire event
       */
      if (this.element.isDesignSystemRoot && this.$parent) {
        this.$parent.$emit('input', value)
        this.$parent.$emit('change', value)
      }
    }


  }
}
</script>
