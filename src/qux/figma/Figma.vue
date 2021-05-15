<template>
  <div class="qux-figma">
    <QUX
      :app="app"
      :config="mergedConfig"
      :showDebug="true"
      :executor="getMethodExcutor()"
      :selected="selected"
      v-model="value"
      ref="qux"
      v-if="app"
      :screen="screen"/>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-figma.scss';
</style>

<script>
import Logger from '../core/Logger'
import QUX from '../QUX.vue'
import FigmaService from './FigmaService'
import * as Util from '../core/ExportUtil'

export default {
  name: 'Figma',
  mixins: [],
  props: {
      'figma': {},
      'screen': {
          type: String
      },
      'debug': {
          type: String
      },
      'selected': {
          type: String
      },
      'executor': {
          type: Object
      },
      'value': {
          type: Object,
          default: function () {
            return {
            }
          }
      },
      'config' : {
        type: Object,
        default: function () {
            return {
            }
        }
      },
      'page': {
        type: String
      }
  },
  data: function () {
    return {
      app: null,
      mergedConfig: {
        figma: {
          varientComponentHoverKey: 'Mouse=Hover',
          varientComponentDefaultKey: 'Mouse=Default'
        },
        loadFonts: true,
        css: {
          grid: true,
          justifyContentInWrapper: false,
          pinnedLeft: false,
          pinnedRight: false,
          fixedHorizontal: false,
          attachLabels: false
        }
      }
    }
  },
  computed:{
  },
  components: {
    'QUX': QUX
  },
  methods: {
    async setFigma (figma) {
       Logger.log(-1, 'Figma.setFigma()', this.page)
       if (figma.figmaFile && figma.figmaAccessKey) {
          let figmaService = new FigmaService(figma.figmaAccessKey, this.mergedConfig)
          let selectedPages = this.page ? [this.page] : []
          let app = await figmaService.get(figma.figmaFile, true, false, selectedPages)
          app = figmaService.setBackgroundImages(app)
          this.app = app
       } else if (figma.screens && figma.widgets){
          this.app = figma
       }
    },
    /**
     * Keep in sync with QUX
     */
    setConfig (c) {
        if (c.css) {
            this.mergedConfig.css = Util.mixin(this.mergedConfig.css, c.css)
        }
        if (c.router) {
            this.mergedConfig.router = Util.mixin(this.mergedConfig.router, c.router)
        }
        if (c.databinding) {
            this.mergedConfig.databinding = Util.mixin(this.mergedConfig.databinding, c.databinding)
        }
        if (c.components) {
            this.mergedConfig.components = c.components
        }
        if (c.imageFolder) {
            this.mergedConfig.imageFolder = c.imageFolder
        }
        if (c.debug) {
            this.mergedConfig.debug = Util.mixin(this.mergedConfig.debug, c.debug)
        }
        if (c.responsive) {
            this.mergedConfig.responsive = c.responsive
        }
        if (c.loadFonts !== undefined) {
            this.mergedConfig.loadFonts = c.loadFonts
        }
        if (c.figma) {
          this.mergedConfig.figma = Util.mixin(this.mergedConfig.figma, c.figma)
        }
        Logger.log(3, 'Figma.setConfig()', JSON.stringify(this.mergedConfig))
    },
    getMethodExcutor () {
        Logger.log(3, 'Figma.getMethodExcutor() > ')
        if (this.executor) {
            return this.executor
        }
        return this.$parent
    },
  },
  mounted () {
    if (this.config) {
          this.setConfig(this.config)
    }
    if (this.figma) {
      this.setFigma(this.figma)
    }
  }
}
</script>
