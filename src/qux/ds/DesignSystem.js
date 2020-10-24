import Logger from "../core/Logger"
import Vue from 'vue'
import QUX from '../QUX'

class DesignSystem {

  constructor () {
    this.server = 'https://quant-ux.com'
  }

  /**
   * Plugin method is async
   */
  async install (vue, conf) {

    console.debug('INSTALL', conf)
    await this.register(conf.app)
  }

	async register(app) {
		Logger.log(-1, "DesignSystem.register()", app)
		if (app.substring) {
      app = await this.loadAppByKey(app)
    }
		this.onAppLoaded(app)
  }

  onAppLoaded (app) {
    Logger.log(-1, "DesignSystem.onAppLoaded() > enter", app)
    Vue.component('QUX', QUX)
    /**
     * FIXME:Convert to tree, pick all screen root elements
     *
     */
    Vue.component('Klaus', {
      data: function () {
        return {
          count: 0
        }
      },
      render (createElement) {
        return createElement(QUX, {
          props: {
           app: app,
           selected: 'BlueButton'
          }
        })
      }
    })

    // generate one css for all the components, cs for each component one css?
  }

	async loadAppByKey(key) {
		Logger.log(2, "DesignSystem.loadAppByKey() > enter", key)
		let url = `${this.server}/rest/invitation/${key}/app.json`
		let start = new Date().getTime()
		const response = await fetch(url)
		if (response.status === 200) {
			let app = await response.json()
			Logger.log(-1, "DesignSystem.loadAppByKey() > exit", new Date().getTime() - start)
			return app
		} else {
			Logger.error("DesignSystem.loadAppByKey() > Could not load")
		}
	}
}
export default new DesignSystem()
