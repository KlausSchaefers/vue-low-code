<template>
  <div :class="['qux-date', cssClass]" @click="onClick">
        <div class="qux-date-header">
            <div class="qux-date-header-btn" @click.stop="onBack">
                <span class="qux-common-valign-center">
                    {{backLabel}}
                </span>
            </div>
            <div class="qux-date-header-label">
                <span class="qux-common-valign-center">
                    {{dateLabel}}
                </span>
            </div>
            <div class="qux-date-header-btn" @click.stop="onNext">
                <span class="qux-common-valign-center">
                       {{nextLabel}}
                </span>
            </div>
        </div>
        <div class="qux-date-body">
            <table>
                <tbody>
                     <tr>
                        <th v-for="d in day_names" :key="d" class="qux-date-week-days">{{d}}</th>
                    </tr>
                    <tr v-for="(week, i) in body" :key="i">
                        <td v-for="(d, j) in week" 
                            :key="j" 
                            @click.stop="onSelect(d)" 
                            :class="[d.css, {'qux-date-weekend': d.weekend}, {'qux-date-workday': !d.weekend}]"
                        >
                            {{d.day}}
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
import Logger from '../core/Logger'

export default {
  name: 'qDate',
  mixins: [_Base],
  props: ['range'],
  data: function () {
      return {
          isRange: false,
          selected: new Date(),
          viewDate: new Date(),
          day_names: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          month_names: [
            "January",
            "February",
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
      backLabel () {
          if (this.element && this.element.props.lastButtonLbl) {
              return '<'
          }
          return '-'
      },
      nextLabel () {
          if (this.element && this.element.props.nextButtonLbl) {
              return '>'
          }
          return '+'
      },
      dateLabel () {
          return this.month_names[this.viewDate.getMonth()] + ' ' + this.viewDate.getFullYear()
      },
      selectedDate () {
        if (this.element) {
            let input = this.dataBindingInput
            if (input) {
                if (input.start && input.end) {
                    if (input.start.toLowerCase) {
                        input.start = Date.parse(input.start)
                    }
                    if (input.end.toLowerCase) {
                        input.end = Date.parse(input.end)
                    }
                }
                if (input.toLowerCase) {
                    input = Date.parse(input)
                }
                return input
            }
          }
          return this.selected;
      },
      body () {

        let year = this.viewDate.getFullYear()
        let month = this.viewDate.getMonth()
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
                day: '',
                year: year,
                month: month,
                weekend: false
            }
            week.push(day)
            /**
             * Chekc if we are in current month
             */
            if (i - offset >= 0) {
                day.day = i - offset + 1 + '';
                var d1 = new Date(year, month, day.day);
                // check that we are not in next months
                if (d1.getMonth() != month) {
                    day.day = ''
                }
            }

            if (i % 7 == 0 || i % 7 == 6) {
                day.weekend = true
            }

            
            day.css = this.getSelectedCSS(day)
            
        }
        return result
      }
  },
  methods: {
      getSelectedCSS (day) {
        if (this.isRange) {
            /**
             * Check if we have start range
             */
            if (this.selected.start) {
                let start = this.selected.start
                if (day.year === start.getFullYear() && day.month === start.getMonth() && day.day == start.getDate()) {
                    return 'qux-date-range-start'
                }
            }

            /**
             * Check if end
             */
            if (this.selected.end) {
               let end = this.selected.end
               if (day.year === end.getFullYear() && day.month === end.getMonth() && day.day == end.getDate()) {
                    return 'qux-date-range-end'
               }
            }

            /**
             * Check if between
             */
            if (this.selected.start && this.selected.end) {
                let dayMS = this.getMillis(day)
                let startMS = this.selected.start.getTime()
                let endMS  =this.selected.end.getTime()
                if (startMS < dayMS && dayMS < endMS) {
                    return 'qux-date-range-middle'
                }
            }
          
        } else {
            let selected = this.selected
            if (day.year === selected.getFullYear() && day.month === selected.getMonth() && day.day == selected.getDate()) {
                return 'qux-date-selected'
            }
        }
        return ''
      },
      getMillis (day) {
          return new Date(day.year, day.month, day.day).getTime()
      },
      onBack () {
        let date = this.viewDate
        let day = date.getDay()
        let month = date.getMonth()
        let year = date.getFullYear()
        month--;
        if (month < 0) {
            month = 11;
            year--;
        }
        this.setView(year, month, day)
      },
      onNext () {
        let date = this.viewDate
        let day = date.getDay()
        let month = date.getMonth()
        let year = date.getFullYear()
        month++;
        if (month > 11) {
            month = 0;
            year++;
        }
        this.setView(year, month, day)
      },
      setView (year, month, day) {
        this.viewDate = new Date(year, month, day)
      },
      onSelect (d) {
    
          if (this.isRange) {
            if (this.selected.end) {
                this.selected.start = new Date(d.year, d.month, d.day),
                this.selected.end = null
            } else {
                this.selected.end  = new Date(d.year, d.month, d.day)
                if (this.selected.start > this.selected.end) {
                    let help = this.selected.start
                    this.selected.start = this.selected.end
                    this.selected.end = help
                }
            }
          
            if (this.selected.end) {
                Logger.log(5, 'qDate.select() > range : ',  this.selected)
                if (this.element) {
                    this.onValueChange({
                        start: this.toIsoString(this.selected.start),
                        end: this.toIsoString(this.selected.end)
                    }, 'default')            
                } else {
                   
                    this.$emit('change', this.selected)
                    this.$emit('update:modelValue', this.selected)
                }
            }

          } else {
            if (d.day !== '') {
                this.selected = new Date(d.year, d.month, d.day)
                 Logger.log(5, 'qDate.select() > date : ',  this.selected)
                if (this.element) {
                    /**
                     * Here is something wrong with UTC offsets
                     */
                    this.onValueChange(this.toIsoString(this.selected), 'default')
                } else {
                    this.$emit('change', this.selected)
                    this.$emit('update:modelValue', this.selected)
                }
            } 
          }
      },
      toIsoString (date) {
          if (date) {
            let month = date.getMonth() + 1
            if (month < 10) {
                month = '0' + month
            }
            let day = date.getDate()
            if (day < 10) {
                day = '0' + day
            }
            return `${date.getFullYear()}-${month}-${day}`
          }
          return null
      }
  },
  watch: {
  },
  mounted () {
    if (this.element) {
        this.isRange = this.element.props.range
    }
    if (this.range === true) {
        this.isRange = true
    }
    if (this.isRange) {
        this.selected = {
            start: new Date(),
            end: new Date(new Date().getTime() + 86400000 * 4)
        }
    }
    if (!this.element && this.value) {
        Logger.log(5, 'qDate.mounted() standalone')
        this.selected = this.value
        if (this.value.start) {
            // copy value to ensure changes are not leaked
            this.selected = {
                start: this.value.start,
                end: this.value.end,
            }
            this.viewDate = this.selected.start
        } else {
            this.viewDate = this.value
        }   
    }
    Logger.log(0, 'qDate.mounted() enter', this.element)
  }
}
</script>
