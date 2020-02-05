<template>
  <div :class="['qux-rating', cssClass]">
		<span 
            :class="['qux-rating-icon']" 
            v-for="option in ratingOptions" 
            @click="select(option)"
            :key="option">
            <span :class="getIcon(option)"></span>
        </span>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-rating.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qRadioGroup',
  mixins: [_Base],
  data: function () {
      return {
          selected: null,
          ratingOptions: [1,2,3,4,5]
      }
  },
  methods: {
      getIcon (option) {
          let input = this.dataBindingInput
          Logger.log(5, 'qRating.isChecked() >' +  option, input)
          if (input) {
            if (input >= option) {
                return 'mdi mdi-star'
            }
          }
          return 'mdi mdi-star-outline'
      },

      select (option) {
        this.onValueChange(option, 'default')
        Logger.log(5, 'qRating.select() >' + this.dataBindingInputPath, option)
      }
  },
  mounted () {
    Logger.log(5, 'qRating.mounted() enter')
  }
}
</script>
