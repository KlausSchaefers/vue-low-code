//import * as Util from './ExportUtil'
import Logger from './Logger'

import * as Flat2Tree from '../transformer/Flat2Tree'
import * as Quant2Flat from '../transformer/Quant2Flat'
import * as Tree2Component from '../transformer/Tree2Component'
import * as Inline from '../transformer/Inline'

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

      // 1) Make a flat model, e.g. merge in master screens
      let flatModel = Quant2Flat.transform(model, this.config)

      // 2) Build a tree and layout everything. This will also layout component sets!
      let treeModel = Flat2Tree.transform(flatModel, this.config)

      // 3) For dynamic widgets, inline all children.
      let inlineModel = Inline.transform(treeModel, this.config)

      if (this.selected) {
        inlineModel = Tree2Component.transform(inlineModel, this.selected, this.config)
      }

      return inlineModel
    }

}
