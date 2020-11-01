import QUX from "./qux/QUX.vue";
import Figma from "./qux/figma/Figma.vue";
import FigmaService from "./qux/figma/FigmaService";
import Logger from "./qux/core/Logger";


export default {
 install(Vue) {
  Vue.component("QUX", QUX);
  Vue.component("Figma", Figma)
 }
};

export function createFigmaService (key) {
    return new FigmaService(key)
}

export function setLogLevel (level) {
    Logger.setLogLevel(level)
}

/*
export async function registerFigmaDesignSystem (figmaFile, figmaAcessKey) {
    if (figmaFile && figmaAcessKey) {
        let figmaService = new FigmaService(figmaAcessKey)
        let app = await figmaService.get(figmaFile, true)

        Object.values(app.screens).forEach(screen => setBackgroundImage(screen))
        Object.values(app.widgets).forEach(widget => setBackgroundImage(widget))
    }
}

export async function registerQUXDesignSystem (app) {

}
*/
