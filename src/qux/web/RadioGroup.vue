<template>
  <div :class="['qux-radiogroup', cssClass]">
		<RadioBox v-for="option in options" 
      :key="option" 
      :lbl="option" 
      :value="isChecked(option)" 
      @change="select(option)"/>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-radiogroup.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'
import RadioBox from './RadioBox'

export default {
  name: 'qRadioGroup',
  mixins: [_Base],
  data: function () {
      return {
          selected: null
      }
  },
  components: {
      'RadioBox': RadioBox
  },
  methods: {
     isChecked (option) {
          let input = this.dataBindingInput
          Logger.log(5, 'qRadioGroup.isChecked() >' +  option, input)
          if (input) {
            return input === option
          }
          return false
      },

      select (option) {
        this.onValueChange(option, 'default')
        Logger.log(5, 'qRadioGroup.select() >' + this.dataBindingInputPath, option)
      }
  },
  mounted () {
    Logger.log(5, 'qRadioGroup.mounted() enter')
  }
}
</script>
