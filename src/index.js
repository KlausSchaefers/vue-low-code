import Luisa from "./qux/Luisa.vue";
import Figma from "./qux/figma/Figma.vue";
import FigmaService from "./qux/figma/FigmaService";
import Logger from "./qux/core/Logger";

import ModelTransformer from './qux/core/ModelTransformer'
import CSSOptimizer from './qux/core/CSSOptimizer'
import CSSFactory from './qux/core/CSSFactory'
import CSSWriter from './qux/core/CSSWriter'

import FigmaDesignSystem from './qux/ds/FigmaDesignSystem'
import QUXDesignSystem from './qux/ds/QUXDesignSystem'

export default {
 install(Vue) {
  Vue.component("Luisa", Luisa);
  Vue.component("LowCode", Luisa);
  Vue.component("Figma", Figma)
 }
};

export function createFigmaService (key) {
    return new FigmaService(key)
}

export function createModelTransformer (app, config = {}, selected = null) {
    return new ModelTransformer(app, config, selected)
}

export function createCSSOptimizer () {
    return new CSSOptimizer()
}

export function createCSSFactory (config = {}, imagePrefix='') {
    return new CSSFactory(config, imagePrefix)
}

export function createCSSWriter (css, id = 'default') {
    return new CSSWriter(css, id)
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