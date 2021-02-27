import Logger from '../core/Logger'
import JSONPath from '../core/JSONPath'
import AbstractAction from './AbstractAction'

export default class Mail extends AbstractAction {

  constructor () {
    super()
    this.luisaUrl = 'https://api.luisa.cloud'
  }


  async execute (step, viewModel) {
    Logger.log(-1, 'Mail.execute() > enter ', step)
    let config = step.config
    try {
      let data = viewModel
      if (config.inputVariable) {
        Logger.log(-1, 'ActionEngine.execute() > crop view model ', config.inputVariable)
        data = JSONPath.get(viewModel, config.inputVariable)
      }
      let response = await this._post(`${this.luisaUrl}/api/actions/${config.appId}/mail2team`, {
        body: config.body,
        subject: config.subject,
        data: data
      }, {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
      if (response) {
        Logger.log(-1, 'ActionEngine.execute() > exit ', response)
      }
    } catch (err) {
      Logger.warn('ActionEngine.execute() > Error ', err)
    }

  }
}