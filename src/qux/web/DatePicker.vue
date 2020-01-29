<template>
  <div :class="['qux-date-picker', cssClass, {'qux-error': hasError}, {'qux-open': isOpen}]" @click="open">
      <span :class="['qux-common-label', {'qux-common-placeholder': !hasValue}]">
            {{selectedLabel}}
      </span>
      <div class="qux-date-picker-expend">
            <span :class="icon + ' qux-date-picker-icon'" v-if="icon"/>
            <span class="qux-date-picker-carret" v-else></span>
      </div>
      <div class="qux-date-picker-popup" @click.stop="" @mousedown.stop="" v-if="isOpen">
          <qDate @change="select" :range="isRange" :value="selectedDate"/>
      </div>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-date-picker.scss';
</style>
<script>

import _Base from './_Base.vue'
import _DND from './_DND.vue'
import Logger from '../core/Logger'
import qDate from './Date.vue'

export default {
  name: 'qDatePicker',
  mixins: [_Base, _DND],
  data: function () {
      return {
        isRange: false,
        isOpen: false,
        selected: null
      }
  },
  components: {
      'qDate': qDate
  },
  computed: {
      icon () {
        if (this.element) {
            if (this.element.props.icon) {
                return this.element.props.icon
            }
        }
        return false
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
      selectedDate () {
        if (this.element) {
            let input = this.dataBindingInput
            if (input) {
                return input
            }
        }
        return this.selected
      },
      selectedLabel () {
          if (this.element) {
            let input = this.dataBindingInput
            if (input) {
                if (input.start && input.end) {
                    return this.toDateString(input.start) + ' - ' + this.toDateString(input.end)
                }   
                if (input.toLowerCase) {
                    input = Date.parse(input)
                }
                return this.toDateString(input)
            }
          }
          if (this.selected) {
              if (this.selected.start && this.selected.end) {
                return this.toDateString(this.selected.start) + ' - ' + this.toDateString(this.selected.end)
              }   
              return this.toDateString(this.selected)
          }

          return this.label
      },
      hasValue () {
        if (this.element) {
            let input = this.dataBindingInput
            return input !== null && input !== undefined
        }
        return this.selected !== null && this.selected !== undefined
      }
  },
  methods: {
      open () {
          Logger.log(5, 'qDatePicker.open()')
          this.isOpen = !this.isOpen
          if (this.isOpen) {
              this._bodyListener = this.on(this.body(), 'mousedown', this.close)
          }
      },
      close () {
          Logger.log(5, 'qDatePicker.close()')
          this.isOpen = false
          if (this._bodyListener) {
              this._bodyListener.remove()
          }
      },
      select (selected) {
        if (this.element) {
          this.onValueChange(selected, 'default')
          Logger.log(5, 'qDatePicker.toggle() >' + this.dataBindingInputPath, selected)
        } else {
          this.selected = selected
          this.$emit('change', this.selected)
          this.$emit('input', this.selected)
          Logger.log(5, 'qDatePicker.select() >',  this.selected)
        }
        setTimeout(this.close, 250)
      },
      toDateString (d) {
        if (d && d.toLocaleDateString) {
            return d.toLocaleDateString()
        }
        return ''
      }
  },
  watch: {
  },
  destroyed () {
      this.close()
  },
  mounted () {
    if (this.element) {
        this.isRange = this.element.props.range
    }
    if (this.range === true) {
        this.isRange = true
    }
    Logger.log(5, 'qDatePicker.mounted() enter', this.element)
  }
}
</script>
