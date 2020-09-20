<template>
  <div :class="['qux-upload-preview', cssClass]" @click="onClick" :style="{'backgroundImage': src}" >
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-upload-preview.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qUploadPreview',
  mixins: [_Base],
  data: function () {
      return {
        dataURL: '',
        placeholder: ''
      }
  },
  computed: {
    src () {
      let file = this.dataBindingInput
      if (file.name && file.size) {
        this.setFile()
        return this.dataURL
      }
      return this.placeholder
    }
  },
  methods: {
     getImagePlaceHolder (widget) {
      var w = widget.w * 2;
      var h = widget.h * 2;
      var c = document.createElement("canvas");
      var context = c.getContext("2d");
      c.width = w;
      c.height = h;
      h += 0.5;
      w += 0.5;
      var n = 0.5;
      context.moveTo(n, n);
      context.lineTo(w, h);
      context.moveTo(w, n);
      context.lineTo(n, h);
      context.strokeStyle = "#333";
      context.strokeWidth = 2;
      context.imageSmoothingEnabled = false;
      context.stroke();
      let url = 'url(' + c.toDataURL("image/png") + ')';
      return url
    },
    setFile () {
      Logger.log(2, 'qUploadPreview.setFile()')
      let file = this.dataBindingInput
      if (file && file.name && file.size) {
        let reader = new FileReader()
        if (reader.readAsDataURL) {
          reader.onload = () => {
            this.dataURL = 'url(' + reader.result + ')'
          }
          reader.readAsDataURL(file)
        }
      }
    }
  },
  watch: {
    value (v) {
      this.setFile(v)
    }
  },
  mounted () {
     Logger.log(4, 'qUploadPreview.mounted()')
     if (this.element) {
       this.placeholder = this.getImagePlaceHolder(this.element)
     }
     this.setFile()
  }
}
</script>