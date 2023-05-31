<template>
  <div :class="['qux-repeater', cssClass]">

      <!--
          FIXME: the forwardClick ($event) contains only the element that was called, nit the value, nor
          the dom event. We would need something like $event1,...$event2

          FIXME: For auto layout we might need a stupid wrapper around that can grow horizontally
          to allow scrolling. In This oculd for now somehow be solved in Figma, so I will ignore this...
      -->
      <div v-for="(row, i) in rows" :key="i" class="qux-repeater-child">
        <component v-for="child in element.children"
            :is="child.qtype"
            :key="child.id"
            :element="getDeepCopy(child, row, i)"
            :model="model"
            :config="config"      
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
      <div v-for="(placeholder, i) in placeholders" :key="'p'+i" class="qux-repeater-child qux-repeater-placeholder" style="height:0px; margin:0px;" >
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
import * as Util from '../core/ExportUtil'

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
        if (Util.isLayoutAuto(this.element)) {
          return []
        }
        return [1,2,3,4,5,6,7]
      },
      rows () {
        console.debug('Repeater', this.element, this.viewModel)
        if (this.element && this.element.props && this.element.props.databinding) {
            let path =  this.element.props.databinding.default
            let value = JSONPath.get(this.viewModel, path)
            Logger.log(-5, 'Repeater.rows() > exit path: > ' + path, value)
            if (Array.isArray(value)) {
                return value
            } else {
              Logger.warn('Repeater.rows() > Value is no array: > ' + path, this.viewModel)
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
        this.updateDataBinding(copy, i, path, true)
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
    updateDataBinding (copy, i, parentPath, isRoot = false) {
        Logger.log(5, 'Repeater.updateDataBinding() > enter : > ' + i, copy.name + ' @ ' + parentPath)

        if (copy.children && copy.children.length > 0) {
            copy.children.forEach(child => {
                /**
                 * Update the path for each child
                 */
                this.updateDataBindingKeys(child, i, parentPath)

                /**
                 * Go doen recursive
                 */
                this.updateDataBinding(child, i, parentPath)
            })
        } else if (isRoot) {
          /**
           * We might have a special case, where the repeater has only one child.
           */
          Logger.log(5, 'Repeater.updateDataBinding() > No wrapper children : > ' + i, copy.name + ' @ ' + parentPath)
          this.updateDataBindingKeys(copy, i, parentPath)
        }
    },

    updateDataBindingKeys (child, i, parentPath) {
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
              Logger.log(2, 'Repeater.updateDataBindingKeys() > exit : > ' +databinding[key])
          }
      }
    },

    forwardClick (i, element, e) {
      let row = this.dataBindingInputPath ? JSONPath.get(this.viewModel, `${this.dataBindingInputPath}[${i}]`) : null
      if (element.lines && element.lines.length > 0) {
        if (this.dataBindingOutputPath && this.dataBindingInputPath) {
          if (row) {
            Logger.log(3, 'qRepeater.forwardClick() > Update databidning' + this.dataBindingOutputPath, row)
            /**
             * FIXME: Should we do a copy here???
             */
            JSONPath.set(this.viewModel, this.dataBindingOutputPath, row)
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
