<template>
  <div :class="['qux-checkgroup', cssClass]">
		<CheckBox v-for="option in checkBoxOptions"
            :key="option.value"
            :lbl="option.label"
            :value="isChecked(option.value)"
            @change="select(option.value)"/>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-checkgroup.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'
import CheckBox from './CheckBox.vue'
//import Vue from 'vue'

export default {
  name: 'qCheckBoxGroup',
  mixins: [_Base],
  data: function () {
      return {
          selected: []
      }
  },
  components: {
      'CheckBox': CheckBox
  },
  computed: {
       checkBoxOptions () {
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
  },
  methods: {
      isChecked (option) {
          Logger.log(5, 'qCheckBoxGroup.isChecked() >' + this.dataBindingInputPath, option)
          let input = this.dataBindingInput
          if (input && Array.isArray(input)) {
            return input.indexOf(option) > -1
          }
          return false
      },
      validateInput (value) { 
  
        const validation = this.element?.props?.validation
        if (!validation) {
          return true
        }  
        if (validation.required === true && (!value || value.length === 0)) {
          return false
        }
        return true
      },

      select (option) {
        let input = this.dataBindingInput
        if (input) {
            if (Array.isArray(input)) {
                let pos = input.indexOf(option)
                if (pos < 0) {
                    input.push(option)
                } else {
                    input = input.filter(item => item !== option)
                    //Vue.delete(input, pos)
                }
            }
        } else {
            input = [option]
        }
        this.onValueChange(input, 'default')
        this.isValid()
        Logger.log(5, 'qCheckBoxGroup.select() >' + this.dataBindingInputPath, input)
      }
  },
  mounted () {
    Logger.log(5, 'qCheckBoxGroup.mounted() enter')
  }
}
</script>
