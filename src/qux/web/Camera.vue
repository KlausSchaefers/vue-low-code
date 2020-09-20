
<template>
  <div :class="['qux-camera', cssClass, {'qux-camera-has-files': hasFiles}]" >
      <span :class="[icon, 'qux-camera-icon']"/>
      <input type="file" ref="input" @change="onFileChange" accept="image/*" capture="user" />
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-camera.scss';
</style>

<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: "qUpload",
  mixins: [_Base],
  data: function () {
    return {
    };
  },
  components: {},
  computed: {
     icon () {
        if (this.element && this.element.style && this.element.style.icon){
            return 'mdi ' + this.element.style.icon
        }
        return ''
    },
    hasFiles () {
      if (this.element) {
        let input = this.dataBindingInput
        if (input) {
            return input !== undefined && input !== null
        }
      }
      return false
    },
    label () {
       if (this.element) {
        let input = this.dataBindingInput
        if (input) {
          if (this.maxFiles > 1 && Array.isArray(input)) {
            return input.map(f => f.name).join(', ')
          } else {
            return input.name
          }
        }
      }
      if (this.element && this.element.props){
          return this.element.props.label
      }
      return ''
    },
    maxFiles () {
        if (this.element && this.element.props && this.element.props.maxFiles !== undefined){
            return this.element.props.maxFiles
        }
        return 1
    }
  },
  methods: {

    onFileChange (e) {
      if (this.$refs.input) {
        let files = this.$refs.input.files;
        if (files.length >= this.maxFiles) {
          this.setFiles(files, e)
        }
      }
    },

    setFiles (files, e) {
      Logger.log(1, 'Camera.setFiles', files)
      if (this.element) {
        if (this.maxFiles === 1) {
          const value = files[0]
          this.onValueChange(value, 'default', e)
          Logger.log(5, 'Upload.setFiles() >' + this.dataBindingInputPath, value)
        } else {
          const value = Array.from(files)
          this.onValueChange(value, 'default', e)
          Logger.log(5, 'Upload.setFiles(1) >' + this.dataBindingInputPath, value)
        }
        this.onClick(e)
      }
    }

  }
};
</script>