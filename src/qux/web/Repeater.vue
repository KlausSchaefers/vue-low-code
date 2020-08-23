<template>
  <div :class="['qux-repeater', cssClass]">

      <!--
          FIXME: the forwardClick ($event) contains only the element that was called, nit the value, nor
          the dom event. We would need something like $event1,...$event2
      -->

      <div v-for="(row, i) in rows" :key="i" class="qux-repeater-child">
        <component v-for="child in element.children"
            :is="child.qtype"
            :key="child.id"
            :element="getDeepCopy(child, row, i)"
            :model="model"
            :config="config"
            v-model="value"
            @qClick="forwardClick(i, $event)"
            @qChange="forwardChange"
            @qKeyPress="forwardKeyPress"
            @qFocus="forwardFocus"
            @qBlur="forwardBlur"
            @qMouseOver="forwardMouseOver"
            @qMouseOut="forwardMouseOut"
            />
      </div>

      <!-- add here some empty placeholder elements to get a nice wrapping... -->
      <div v-for="(placeholder, i) in placeholders" :key="'p'+i" class="qux-repeater-child qux-repeater-placeholder" style="height:0px; margin:0px;">
      </div>

  </div>
</template>
<style lang="scss">
    @import '../scss/qux-repeater.scss';
</style>
<script>

import _Base from './_Base.vue'
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
      placeholders () {
        /**
         * Make here some better math and calculate hwo many elements i really need?
         */
        return [1,2,3,4,5,6,7]
      },
      rows () {
        if (this.element && this.element.props && this.element.props.databinding) {
            let path =  this.element.props.databinding.default
            let value = JSONPath.get(this.value, path)
            Logger.log(5, 'Repeater.rows() > exit path: > ' + path, value)
            if (Array.isArray(value)) {
                return value
            } else {
              Logger.warn('Repeater.rows() > Value is no array: > ' + path, value)
            }
        } else {
            return this.getRowsFromTable(this.element)
        }
        return []
      }
  },
  methods: {
    getDeepCopy (element, row, i) {
        Logger.log(4, 'Repeater.getDeepCopy() > exit : > ' + i, row)
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
                     * FIXME: Make this somehow better
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
        Logger.log(5, 'Repeater.updateDataBinding() > exit : > ' + i, copy.name)
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
    forwardClick (i, element, e) {
      let row = this.dataBindingInputPath ? JSONPath.get(this.value, `${this.dataBindingInputPath}[${i}]`) : null
      if (element.lines && element.lines.length > 0) {
        if (this.dataBindingOutputPath && this.dataBindingInputPath) {
          if (row) {
            Logger.log(3, 'qRepeater.forwardClick() > Update databidning' + this.dataBindingOutputPath, row)
            JSONPath.set(this.value, this.dataBindingOutputPath, row)
          }
        }
      }
      /**
       * We could still check if there is a click method defined on the repeater and dispatch the click on this element
       * if the clicked child does not have a link or call back
       */
      Logger.log(5, 'qRepeater.forwardClick() ', JSON.stringify(row))
      this.$emit('qClick', element, e, row);
    },
    forwardChange (element, e, value) {
      this.$emit('qChange', element, e, value);
    },
    forwardFocus (element, e, value) {
      this.$emit('qFocus', element, e, value);
    },
    forwardBlur (element, e, value) {
      this.$emit('qBlur', element, e, value);
    },
    forwardMouseOver (element, e, value) {
      this.$emit('qMouseOver', element, e, value);
    },
    forwardMouseOut (element, e, value) {
      this.$emit('qMouseOut', element, e, value);
    },
    forwardKeyPress (element, e, value) {
      this.$emit('qKeyPress', element, e, value)
    },
    forwardCallback (element, e, value) {
      this.$emit('qCallback', element, e, value)
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
      Logger.log(3, 'Repeater.mounted() > enter', this.element)
  }
}
</script>
