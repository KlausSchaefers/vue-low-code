import * as Util from './ExportUtil'

class Config {

	constructor() {

  }

  getDefault () {
    return {
			debug: {
				logLevel: 0,
			},
			designletPrefix:'',
			loadFonts: true,
			css: {
				grid: true,
				justifyContentInWrapper: false,
				attachLabels: true,
			},
			router: {
				key: "screenName",
				prefix: "",
			},
			databinding: {
				default: "",
			},
      imageFolder: "/img",
      components: {},
			breakpoints: {
				mobile: {
					min: 0,
					max: 400,
				},
				tablet: {
					min: 401,
					max: 1200,
				},
				desktop: {
					min: 1201,
					max: 1000000,
				},
			},
			addDefaultDatabinding: true
    }
  }


  merge (config, overwrites) {
		if (overwrites.addDefaultDatabinding !== undefined) {
			config.addDefaultDatabinding = overwrites.addDefaultDatabinding
		}
    if (overwrites.css) {
      config.css = Util.mixin(config.css, overwrites.css)
    }
    if (overwrites.router) {
      config.router = Util.mixin(config.router, overwrites.router)
    }
    if (overwrites.databinding) {
      config.databinding = Util.mixin(config.databinding, overwrites.databinding)
    }
    if (overwrites.components) {
      config.components = overwrites.components
    }
    if (overwrites.imageFolder) {
      config.imageFolder = overwrites.imageFolder
    }
    if (overwrites.debug) {
      config.debug = Util.mixin(config.debug, overwrites.debug)
		}
		if (overwrites.designletPrefix) {
			config.designletPrefix = overwrites.designletPrefix
		}
		if (overwrites.loadFonts !== undefined) {
			config.loadFonts = overwrites.loadFonts
		}
		if (overwrites.responsive) {
			config.responsive = overwrites.responsive
		}
    return config
  }


}
export default new Config()
