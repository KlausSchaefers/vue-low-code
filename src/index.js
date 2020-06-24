import QUX from "./qux/QUX.vue";
import Figma from "./qux/figma/Figma.vue";


export default {
 install(Vue, options) {
  // Let's register our component globally
  // https://vuejs.org/v2/guide/components-registration.html
  Vue.component("QUX", QUX);
  Vue.component("Figma", Figma)
 }
};

export function download () {
    console.debug('DownLoad')
}