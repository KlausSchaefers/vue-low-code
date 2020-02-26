<template>
  <div :class="['qux-dropdown', cssClass, {'qux-error': hasError}, {'qux-open': isOpen}, {'qux-dropdown-mobile': isMobile}]" @click="open">
      <span class="qux-common-label">
            {{selectOption}}
      </span>
      <div class="qux-dropdown-expend">
        <span class="qux-dropdown-carret"></span>
      </div>
      <div class="qux-dropdown-popup" v-if="isOpen">
          <span v-for="o in dropDownOption" :key="o.label" class="qux-dropdown-item" @mousedown.stop="select(o)">
              {{o.label}}
          </span>
      </div>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-dropdown.scss';
</style>
<script>

import _Base from './_Base.vue'
import _DND from './_DND.vue'
import Logger from '../core/Logger'

export default {
  name: 'qDropDown',
  mixins: [_Base, _DND],
  data: function () {
      return {
        isOpen: false,
        selected: null
      }
  },
  computed: {
      isMobile () {
          if (this.element && this.element.type === 'MobileDropDown') {
              return true
          }
          let userAgent = navigator.userAgent || navigator.vendor || window.opera;
          return /iPad|iPhone|iPod/.test(userAgent) || /android/i.test(userAgent)
      },
      dropDownOption () {
          if (this.element) {
            return this.options.map(o => {
                if (o.toLowerCase) {
                    return {
                        label: o,
                        value: o
                    }
                }
                return o
            })
          }
          return []
      },
      selectOption () {
          if (this.element) {
            let input = this.dataBindingInput
            if (input) {
                let found = this.options.find(o => {
                    return o.value === input
                })
                if (found) {
                    return found.label
                }
                return input
            } else {
                let option = this.options[0]
                if (option.label) {
                    return option.label
                }
                return option
            }
          }
          return this.selected
      }
  },
  methods: {
      open () {
          Logger.log(5, 'qDropDown.open()')
          this.isOpen = !this.isOpen
          if (this.isOpen) {
              this._bodyListener = this.on(this.body(), 'mousedown', this.close)
          }
      },
      close () {
          Logger.log(5, 'qDropDown.close()')
          this.isOpen = false
          if (this._bodyListener) {
              this._bodyListener.remove()
          }
      },
      select (option) {
        Logger.log(5, 'qDropDown.select()', option)
        if (this.element) {
          this.onValueChange(option.value, 'default')
          Logger.log(5, 'qDropDown.toggle() >' + this.dataBindingInputPath, option.value)
        } else {
          this.selected = option.value
          this.$emit('change', this.selected)
          this.$emit('input', this.selected)
          Logger.log(5, 'qSwitch.select() >' + this.selected)
        }
        this.close()
      }
  },
  watch: {
  },
  destroyed () {
      this.close()
  },
  mounted () {
    Logger.log(5, 'qDropDown.mounted() enter')
  }
}
</script>
