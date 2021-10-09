
import FigmaService from "./qux/figma/FigmaService";
import Logger from "./qux/core/Logger";

import ModelTransformer from './qux/core/ModelTransformer'
import CSSOptimizer from './qux/core/CSSOptimizer'
import CSSFactory from './qux/core/CSSFactory'
import CSSWriter from './qux/core/CSSWriter'
import qux from './qux'

import FigmaDesignSystem from './qux/ds/FigmaDesignSystem'
import QUXDesignSystem from './qux/ds/QUXDesignSystem'

export default {
 install(app) {
    qux.install(app)
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