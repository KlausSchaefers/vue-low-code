import QUX from "./qux/QUX.vue";
import Figma from "./qux/figma/Figma.vue";
import FigmaService from "./qux/figma/FigmaService";
import Logger from "./qux/core/Logger";

import FigmaDesignSystem from './qux/ds/FigmaDesignSystem'
import QUXDesignSystem from './qux/ds/QUXDesignSystem'

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

export async function createFigmaDesignlets (figmaFile, figmaAcessKey, config) {
  return FigmaDesignSystem.register(figmaFile, figmaAcessKey, config)
}

export async function createFigmaDesignSystem (figmaFile, figmaAcessKey, config) {
    return FigmaDesignSystem.register(figmaFile, figmaAcessKey, config)
}


export async function createQUXDesignlets (app, config) {
    return QUXDesignSystem.register(app, config)
}

export async function createQUXDesignSystem (app, config) {
    return QUXDesignSystem.register(app, config)
}


export function getDesignSystem () {
    return QUXDesignSystem
}