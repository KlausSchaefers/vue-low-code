<template>
  <div :class="['qux-checkgroup', cssClass]">
		<CheckBox v-for="option in options" 
            :key="option" 
            :lbl="option" 
            :value="isChecked(option)" 
            @change="select(option)"/>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-checkgroup.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'
import CheckBox from './CheckBox'
import Vue from 'vue'

export default {
  name: 'qRadioGroup',
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

      select (option) {
        
        let input = this.dataBindingInput
        if (input) {
            if (Array.isArray(input)) {
                let pos = input.indexOf(option)
                if (pos < 0) {
                    input.push(option)
                } else {
                    Vue.delete(input, pos)
                }
            }
        } else {
            input = [option]
        }
        this.onValueChange(input, 'default')
        Logger.log(5, 'qCheckBoxGroup.select() >' + this.dataBindingInputPath, input)
      }
  },
  mounted () {
    Logger.log(5, 'qCheckBoxGroup.mounted() enter')
  }
}
</script>
