import QUX from "./qux/QUX.vue";

export default {
 install(Vue, options) {
  // Let's register our component globally
  // https://vuejs.org/v2/guide/components-registration.html
  Vue.component("QUX", QUX);
 }
};

export function download () {
    console.debug('DownLoad')
}