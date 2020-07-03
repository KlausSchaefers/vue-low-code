<template>
  <div :class="['qux-segment', cssClass]">
    <div :class="['qux-segment-item', {'qux-segment-item-selected': isChecked(option)}]" v-for="option in segmentOptions" :key="option.value" @click="select(option)">
        <span class="qux-segment-item-label">
            {{option.label}}
        </span>
    </div>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-segment.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'
import Vue from 'vue'

export default {
  name: 'qStepper',
  mixins: [_Base],
  data: function () {
      return {
          selected: null
      }
  },
  computed: {
      segmentOptions () {
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
      isMultiSelect () {
          if (this.element) {
              return this.element.props.multi
          }
          return false
      }
  },
  methods: {
      isChecked (option) {
        let input = this.dataBindingInput
        if (input) {
            if (this.isMultiSelect) {
                Logger.log(5, 'qSegmentButton.isChecked() > Mutli : ' +  option.value, input)
                return input.indexOf(option.value) >= 0
            } else {
                Logger.log(5, 'qSegmentButton.isChecked() > Single : ' +  option.value, input)
                return input === option.value
            }
        }
        return false
      },

      select (option) {
        let value = option.value
        if (this.isMultiSelect) {
            let input = this.dataBindingInput
            if (input) {
                if (!Array.isArray(input)) {
                   input = [input]
                }
                let pos = input.indexOf(value)
                if (pos < 0) {
                    input.push(value)
                } else {
                    Vue.delete(input, pos)
                }

            } else {
                input = [value]
            }
            this.onValueChange(input, 'default')
            Logger.log(5, 'qSegmentButton.select() > Single: ' + this.dataBindingInputPath, )
          } else {
            this.onValueChange(value, 'default')
            Logger.log(5, 'qSegmentButton.select() > Single: ' + this.dataBindingInputPath, value)
          }
      }
  },
  mounted () {
  }
}
</script>
