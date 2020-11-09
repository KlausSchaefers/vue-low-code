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
     * but the labels would not be found, neither slots would work.
     *
     * TODO: This should be fixed since 0.4.40
     */
    let config = {
      css: {
        attachLabels: true
      }
    }
    /**
     * Pass here also the hasComponentSet = true!
     */
    return QUXDesignSystem.register(app, config, true)
  }
}

export default new FigmaDesignSystem()