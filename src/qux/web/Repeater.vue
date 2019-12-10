<template>
  <div :class="['qux-repeater', cssClass]">
      <!--
          FIXME: I call the copy thing here a lot! Maybe it would be better
          to add the children to the row? Dunno, let's see later.
      -->
      <div v-for="(row, i) in rows" :key="i" class="qux-repeater-child">
        <component v-for="child in element.children" 
            :is="child.qtype" 
            :key="child.id" 
            :element="getDeepCopy(child, row, i)" 
            :model="model"
            :config="config"
            v-model="value"
            @qClick="forwardClick"
            @qChange="forwardChange"
            @qKeyPress="forwardKeyPress"
            @qFocus="forwardFocus"
            @qBlur="forwardBlur"
            @qMouseOver="forwardMouseOver"
            @qMouseOut="forwardMouseOut"
            />
      </div>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-repeater.scss';
</style>
<script>

import _Base from './_Base'
import JSONPath from '../core/JSONPath'
import Logger from '../core/Logger'

export default {
  name: 'qRepeater',
  mixins: [_Base],
  data: function () {
      return {
        debug: false
      }
  },
  computed: {
      rows () {
        if (this.element && this.element.props && this.element.props.databinding) {
            let path =  this.element.props.databinding.default
            let value = JSONPath.get(this.value, path)
            Logger.log(0, 'Repeater.rows() > exit path: > ' + path, value)
            if (Array.isArray(value)) {
                return value
            }
        } else {
            return this.getRowsFromTable(this.element)
        }
        return []
      }
  },
  methods: {
    getDeepCopy (element, row, i) {
        Logger.log(0, 'Repeater.getDeepCopy() > exit : > ' + i, row)
        let copy = this.clone(element)
        let path = this.dataBindingInputPath
        this.updateDataBinding(copy, i, path)
        return copy
    },
    clone(obj) {
        if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj)
            return obj;

        let temp = obj.constructor();
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (key !== 'parent') {
                    /**
                     * Make this somehow better
                     */
                    obj['isActiveClone'] = null;
                    temp[key] = this.clone(obj[key]);
                    delete obj['isActiveClone'];
                } else {
                     temp[key] = obj[key]
                }
            }
        }
        return temp;
    },
    updateDataBinding (copy, i, parentPath) {
        Logger.log(0, 'Repeater.updateDataBinding() > exit : > ' + i, copy.name)
        if (copy.children) {
            copy.children.forEach(child => {
                if (child && child.props && child.props.databinding) {
                    let databinding = child.props.databinding
                    for (let key in databinding) {
                        let path = databinding[key]
                        // if we have parent path remove
                        if (path.indexOf(parentPath) === 0) {
                           path = path.substring(parentPath.length)
                        }
                        // if path starts with array we remove
                        if (path.indexOf('[0]') === 0) {
                           path = path.substring(3)
                        }
                        if (path.indexOf('.') === 0) {
                           path = path.substring(1)
                        }
                        databinding[key] = `${parentPath}[${i}].${path}`
                        //Logger.log(0, 'Repeater.updateDataBinding() > exit : > ' + copy.name, databinding[key])
                        // otherwise add parent
                    }
                }
                this.updateDataBinding(child, i, parentPath)
            })
        }
    },
    forwardClick (element, e) {
      this.$emit('qClick', element, e);
    },
    forwardChange (element, e) {
      this.$emit('qChange', element, e);
    },
    forwardFocus (element, e) {
      this.$emit('qFocus', element, e);
    },
    forwardBlur (element, e) {
      this.$emit('qBlur', element, e);
    },
    forwardMouseOver (element, e) {
      this.$emit('qMouseOver', element, e);
    },
    forwardMouseOut (element, e) {
      this.$emit('qMouseOut', element, e);
    },
    forwardKeyPress (element, e) {
      this.$emit('qKeyPress', element, e)
    },
    getRowsFromTable (widget) {
        let result = []
        if (widget.props.data && widget.props.data.length > 1) {
            let data = widget.props.data
            this.dataBindingValues = []
            let header = widget.props.data[0]
            for (let r=1; r < data.length; r++) {
                let row = {}
                for (let c=0; c < header.length; c++) {
                    let col = header[c]
                    row[col] = data[r][c]
                }
                result.push(row)
            }
        }
        return result
    }
  },
  mounted () {
      Logger.log(0, 'Repeater.mounted() > enter', this.element)
     //console.debug('Container.mounted()', this.element.name, this.element.isColumn, this.element.isRow)
  }
}
</script>
