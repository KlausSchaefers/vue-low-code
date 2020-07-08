<template>
  <div class="qux-figma">
    <QUX :app="app" :config="config" :showDebug="true" :executor="getMethodExcutor()" v-model="value" ref="qux" v-if="app"/>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-figma.scss';
</style>

<script>
import Logger from '../core/Logger'
import QUX from '../QUX.vue'
import FigmaService from './FigmaService'

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
      }
  },
  data: function () {
    return {
      app: null
    }
  },
  computed:{
  },
  components: {
    'QUX': QUX
  },
  methods: {
    async setFigma (figma) {
       Logger.log(-1, 'Figma.setFigma()')
       if (figma.figmaFile && figma.figmaAccessKey) {
          let figmaService = new FigmaService(figma.figmaAccessKey)
          /**
           * FIXME: Somehow allow frames and groups here...
          */
          // figmaService.ignoredTypes = ['GROUP']
          let app = await figmaService.get(figma.figmaFile, true)
          Object.values(app.screens).forEach(screen => this.setBackgroundImage(screen))
          Object.values(app.widgets).forEach(widget => this.setBackgroundImage(widget))
          this.app = app
       } else if (figma.screens && figma.widgets){
          this.app = figma
       }
    },
    setBackgroundImage (element) {
      if (element.props.figmaImage) {
        element.style.backgroundImage = {
          url: element.props.figmaImage
        }
      }
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
    if (this.figma) {
      this.setFigma(this.figma)
    }
  }
}
</script>