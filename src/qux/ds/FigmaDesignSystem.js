import Logger from "../core/Logger"
import FigmaService from '../figma/FigmaService'
import QUXDesignSystem from './QUXDesignSystem'

class FigmaDesignSystem {

  async register(figmaFile, figmaAccessKey) {
    Logger.log(-1, "DesignSystem.register()", figmaFile)
    let app = figmaFile
    if (figmaFile && figmaAccessKey) {
      let figmaService = new FigmaService(figmaAccessKey)
      app = await figmaService.get(figmaFile, true)
      app = figmaService.setBackgroundImages(app)
    }
    /**
     * In <Figma> we do not attach labels. This gives a better design (grid instead of padding),
     * but the labels would not be found, neither slots would work
     */
    let config = {
      css: {
        attachLabels: true
      }
    }
    return QUXDesignSystem.register(app, config)
  }
}

export default new FigmaDesignSystem()