<template>
  <div :class="['qux-date', cssClass]" @click="onClick">
        <div class="qux-date-header">
            <div class="qux-date-header-btn">
                <span class="qux-common-valign-center">-</span>
            </div>
            <div class="qux-date-header-label">
                <span class="qux-common-valign-center">
                    {{currentDate}}
                </span>
            </div>
            <div class="qux-date-header-btn">
                <span class="qux-common-valign-center">+</span>
            </div>
        </div>
        <div class="qux-date-body">
            <!-- render as divs with flex -->
            <table>
                <thead>
                    <tr>
                        <th v-for="d in day_names" :key="d">{{d}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(week, i) in body" :key="i">
                        <td v-for="(d, j) in week" :key="j">
                            {{d.lbl}}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-date.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
  name: 'qDate',
  mixins: [_Base],
  data: function () {
      return {
          day_names: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          month_names: [
            "Januar",
            "Februar",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ]
      }
  },
  computed: {
      dateLabel () {
          return this.currentDate.toString()
      },
      currentDate () {
          return new Date()
      },
      body () {
        let year = this.currentDate.getFullYear()
        let month = this.currentDate.getMonth()
        let first = new Date(year, month , 1);
        let offset = first.getDay();
        let week = []
        let result = []
        // male 45 and filter empty last row
        for (let i = 0; i < 35; i++) {
            if (i % 7 == 0) {
                week = []
                result.push(week)
            }
            let day = {
                lbl: '',
                year: year,
                month: this.month_names[month],
                weekend: false
            }
            week.push(day)
            /**
             * Chekc if we are in current month
             */
            if (i - offset >= 0) {
                day.lbl = i - offset + 1;
                var d1 = new Date(year, month, day.lbl);
                // check that we are not in next months
                if (d1.getMonth() != month) {
                    day.lbl = ''
                }
            }

            if (i % 7 == 0 || i % 7 == 6) {
                day.weekend = true
            }
        }
        return result
      }
  },
  mounted () {
     //console.debug('Button.mounted()')
  }
}
</script>
