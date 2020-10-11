<template>
    <div :class="['qux-table', cssClass]" >

        <table>
            <thead>
                <tr>
                    <th v-for="col in columns" :key="col.id" :class="'qux-table-cell qux-table-column-' + col.id" @click="sortBy(col)">
                        {{col.label}}
                        <span v-if="sortColumn.id == col.id && sortOrder === 'asc'" class="mdi mdi-chevron-down">

                        </span>
                         <span v-if="sortColumn.id == col.id && sortOrder !== 'asc'" class="mdi mdi-chevron-up">

                        </span>
                    </th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="row in sortedRows" :key="row.id" class="qux-table-row">
                    <td v-if="hasCheckBox" class="qux-table-cell">
                        <CheckBox :value="isRowSelected(row)" @change="selectRow(row)"/>
                    </td>
                    <td v-for="(value,i) in row.values" :key="i" class="qux-table-cell">
                        {{value}}
                    </td>
                    <td v-if="hasActions" class="qux-table-action-cntr">
                        <a v-for="(action,i) in actions"
                            @click="onActionClick(action, row)"
                            :key="action.label"
                            :class="['qux-table-action','qux-table-action-' + i, {'qux-table-action-hover': action.isHover }]">
                            {{action.label}}
                        </a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<style lang="scss">
    @import '../scss/qux-table.scss';
    @import '../scss/qux-checkbox.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'
import CheckBox from './CheckBox.vue'

export default {
  name: 'qTable',
  mixins: [_Base],
  data: function () {
      return {
          'selected': [],
          'sortColumn': '',
          'sortOrder': 'arc'
      }
  },
  components: {
      'CheckBox': CheckBox
  },
  computed: {
    columns () {
        if (this.element) {
            console.debug(this.element.name, this.element.props.columns)
            let columns = []
            if (this.element.props.columns && this.element.props.columns.length > 0) {
                columns = this.element.props.columns.map((col) => col.label)
            } else {
                let data = this.parseData(this.element.props.data)
                columns = data[0]
            }
            let offset = 0
            if (this.hasCheckBox) {
                columns.unshift('')
                offset = 1
            }
            if (this.hasActions) {
                columns.push('')
            }
            return columns.map((col, i) => {
                return {
                    id: i,
                    label: col,
                    key:i - offset
                }
            })
        }
        return []
    },
    hasCheckBox () {
        if (this.element) {
            return this.element.style.checkBox === true
        }
        return false
    },
    hasActions () {
        if (this.element) {
            return this.element.props.tableActions && this.element.props.tableActions.length > 0
        }
        return false
    },
    actions () {
        if (this.element) {
            return this.element.props.tableActions
        }
        return []
    },
    sortedRows () {
        if (this.sortColumn) {
            let key = this.sortColumn.key
            let rows = this.rows
            return rows.sort((a,b) => {
                let valueA = a.values[key]
                let valueB = b.values[key]
                console.debug(valueA, '?', valueB)
                if (valueA.localeCompare && valueB.localeCompare) {
                    if (this.sortOrder === 'asc') {
                        return valueA.localeCompare(valueB)
                    } else {
                        return valueB.localeCompare(valueA)
                    }

                }
                if (this.sortOrder === 'asc') {
                    return valueA - valueB
                } else {
                    return valueB - valueA
                }
            })
        }
        return this.rows
    },
    rows () {
        let dataBindingInput = this.dataBindingInput
        if (dataBindingInput && Array.isArray(dataBindingInput)) {
            if (this.element && this.element.props &&  this.element.props.columns && this.element.props.columns.length > 0) {
                let cols = this.element.props.columns
                return dataBindingInput.map((row, i) => {
                    let values = cols.map(col => {
                        if (row[col.databinding] !== undefined) {
                            return row[col.databinding]
                        }
                        return ''
                    })
                    return {
                        id: i,
                        values: values,
                        obj: row
                    }
                })
            }
            return dataBindingInput
        } else {
            if (this.element) {
                let data = this.parseData(this.element.props.data)
                return data.filter((row, i) => i > 0).map((row, i) => {
                    return {
                        id: i,
                        values: row,
                        obj: row
                    }
                })
            }
        }
        return []
    }
  },
  methods: {
    sortBy (col) {
        Logger.log(0, 'qTable.sortBy() enter > ', col)
        this.sortColumn = col
        if (this.sortOrder === 'asc') {
            this.sortOrder = 'desc'
        } else {
            this.sortOrder = 'asc'
        }
    },
    onActionClick (action, row) {
        Logger.log(5, 'qTable.onActionClick() enter > ' + action.label, row)
        this.$emit('qCallback', this.element, {
            callback: action.callback,
            params: row.obj
        })
    },
    selectRow (row) {
        let pos = this.selected.indexOf(row.id)
        if (pos < 0) {
            this.selected.push(row.id)
        } else {
            this.$delete(this.selected, pos)
        }
        let databinding = this.dataBinding
        if (databinding.output) {
            let values = this.rows.filter(row => this.selected.indexOf(row.id) >= 0).map(row => row.obj)
            this.onValueChange(values, 'output')
        }
    },
    isRowSelected (row) {
        return this.selected.indexOf(row.id) >= 0
    },
    parseData (data) {
      /**
       * for now assume csv
       */
      if (data.substring) {
        var table = [];
        var lines = data.split("\n");
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          table.push(line.split(","));
        }
        return table;
      } else {
        return data;
      }
    }
  },
  mounted () {
    Logger.log(5, 'qTable.mounted() enter')
  }
}
</script>
