//import * as Util from './ExportUtil'
import Logger from './Logger'

import * as Flat2Tree from '../transformer/Flat2Tree'
import * as Quant2Flat from '../transformer/Quant2Flat'
import * as Tree2Component from '../transformer/Tree2Component'

/**
 * This class transforms an absolute quant-ux model into an
 * kind of HTML model, where the elements have a real parent
 * child relation child
 */
export default class ModelTransformer {

    constructor (app, config = {}, selected = null) {
      this.config = config
      this.model = app
      this.selected = selected
    }

    transform () {
      Logger.log(0, 'ModelTransformer.transform()', this.selected)
      let model = this.model

      let flatModel = Quant2Flat.transform(model, this.config)
      let treeModel = Flat2Tree.transform(flatModel, this.config)

      if (this.selected) {
        treeModel = Tree2Component.transform(treeModel, this.selected, this.config)
      }

      return treeModel
    }

}
