<template>
  <div :class="['qux-compoment-set', cssClass]" @click="toggle">

      <template v-if="selectedChild">
        <component
          :is="selectedChild.qtype"
          :key="selectedChild.id"
          :element="selectedChild"
          :model="model"
          :config="config"
          @qDesignSystemCallback="forwardDesignSystemCallback"
          @qCallback="forwardCallback"
          @qClick="forwardClick"
          @qChange="forwardChange"
          @qKeyPress="forwardKeyPress"
          @qFocus="forwardFocus"
          @qBlur="forwardBlur"
          @qMouseOver="forwardMouseOver"
          @qMouseOut="forwardMouseOut"
          />
      </template>
      <template v-else>
          {{qErrorMessage}}
      </template>

  </div>
</template>
<style lang="scss">
    @import '../scss/qux-component-set.scss';
</style>
<script>

import _Base from './_Base.vue'
import * as Util from '../core/ExportUtil'
import Logger from '../core/Logger'

export default {
  name: 'qComponentSet',
  mixins: [_Base],
  data: function () {
      return {
        checked: false,
        qErrorMessage: 'No varient matching!',
        debug: false
      }
  },
  computed: {
    isActive () {
      if (this.isDesignSystemRoot) {
        /**
         * If no v-model is passed, we take the checked
         */
        if (this.modelValue === undefined ) {
          return this.checked
        }
        return this.modelValue
      }
      if (this.element) {
        let input = this.dataBindingInput
        return input === true
      }
      return this.checked
    },
    selectedChild () {

      if (this.element && this.$parent) {
        let matches = this.getMatchesByVarient()
        Logger.log(2, 'qComponentSet.selectedChild() ', matches)
        if (Util.isChildrenToggle(this.element) && this.element.children.length > 1) {
           if (matches.length == 2) {
             /**
              * FIXME: Herre the order matters!
              */
            if (this.isActive) {
              return matches[1]
            } else {
              return matches[0]
            }
          } else {
            Logger.error('qComponentSet.selectedChild() > More than 2 matches for toggle', matches)
          }
        } else {
          if (matches.length === 1) {
            return matches[0]
          } else {
            Logger.error('qComponentSet.selectedChild() > More than 1 macthes', matches)
          }
        }
      }
      return null
    },
    justifyContent () {
      if (Util.isWrappedContainer(this.element) && this.config.css.justifyContentInWrapper) {
        return true
      }
      return false
    },
    wrapperPlaceHolders () {
      return [1,2,3,4,5,6,7,8]
    }
  },
  methods: {
    toggle (e) {
      if (this.element) {
        let value = !this.isActive
        this.onValueChange(value, 'default')
        Logger.log(4, 'qComponentSet.toggle(element) > ' + this.dataBindingInputPath, value)
        this.checked = value
      } else {
        this.checked = !this.checked
        this.$emit('change', this.checked)
        this.$emit('update:modelValue', this.checked)
        Logger.log(5, 'qComponentSet.toggle() >' + this.checked)
      }
      /**
       * Also fire onClick
       */
      this.onClick(e)
    },
    getMatchesByVarient () {
      let variantKeys = this.getPresentPropertyKeys()
      Logger.log(4, 'qComponentSet.toggle(element) > ' + this.element.name, variantKeys)
      let matches = this.element.children.filter(child => {
          if (child.variant) {
            let isMatch = true
            variantKeys.forEach(key => {
              let value = child.variant[key]
              isMatch &= value === this.$parent.$props[key]
            })
            return isMatch
          }
          return false
      })
      return matches
    },
    getPresentPropertyKeys () {
      if (this.element && this.element.children.length > 1) {
        /**
         * Assume the first child has all variants
         */
        let firstChild = this.element.children[0]
        if (firstChild.variant) {
          return Object.keys(firstChild.variant).filter(key => {
              let value = this.$parent.$props[key]
              return value !== undefined
          })
        }
      }
      return []
    },
    getMatchByProps () {
      let matches = this.element.children.filter(child => {
        if (child.variant) {
          let isMatch = true
          for (let key in child.variant) {
            let value = child.variant[key]
            isMatch &= value === this.$parent.$props[key]
          }
          return isMatch
        }
        return false
      })
      return matches
    },
    getValue () {
      return this.isActive
    },
    forwardClick (element, e, value) {
      this.$emit('qClick', element, e, value);
    },
    forwardChange (element, e, value) {
      this.$emit('qChange', element, e, value);
    },
    forwardFocus (element, e, value) {
      this.$emit('qFocus', element, e, value);
    },
    forwardBlur (element, e, value) {
      this.$emit('qBlur', element, e, value);
    },
    forwardMouseOver (element, e, value) {
      this.$emit('qMouseOver', element, e, value);
    },
    forwardMouseOut (element, e, value) {
      this.$emit('qMouseOut', element, e, value);
    },
    forwardKeyPress (element, e, value) {
      this.$emit('qKeyPress', element, e, value)
    },
    forwardCallback (element, e, value) {
      this.$emit('qCallback', element, e, value)
    }
  },
  mounted () {
    // console.debug('ComponentSet.mounted()', this.element.name, this.label, this.element)
  }
}
</script>
