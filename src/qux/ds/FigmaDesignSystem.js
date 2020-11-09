import Logger from "../core/Logger"
import FigmaService from '../figma/FigmaService'
import QUXDesignSystem from './QUXDesignSystem'

class FigmaDesignSystem {

  async register(figmaFile, figmaAccessKey, config) {
    Logger.log(-1, "DesignSystem.register()", figmaFile)
    let app = figmaFile
    if (figmaFile && figmaAccessKey) {
      let figmaService = new FigmaService(figmaAccessKey)
      app = await figmaService.get(figmaFile, true)
      app = figmaService.setBackgroundImages(app)
    }

    /**
     * Pass here also the hasComponentSet = true!
     */
    return QUXDesignSystem.register(app, config, true)
  }
}

export default new FigmaDesignSystem()