import Logger from './Logger'

class FontWriter {

    constructor () {
        this.fontElement = {}
        this.defaultFontFamilies = {
            'Helvetica Neue,Helvetica,Arial,sans-serif': true,
            'Arial, sans-serif': true,
            'Comic Sans MS, cursive, sans-serif': true,
            'Impact, Charcoal, sans-serif': true,
            'Times New Roman, Times, serif': true,
            'Courier New, Courier, monospace': true,
            '"Palatino Linotype", "Book Antiqua", Palatino, serif': true,
            'Georgia, serif': true,
            'Roboto': true
        }
    }

    /**
     * https://developers.google.com/fonts/docs/getting_started
     */
    write (model, config) {
        Logger.log(1, 'FontWriter.write() > enter')

        let fonts = this.getCustomFonts(model)
        if (config.loadFonts) {
            this.writeImportStatements(fonts)
        } else {
            if (config.loadFontsWarning !== false) {
                this.showImportWarning(fonts)
            } 
        }

    }

    showImportWarning (fonts) {
        if (Object.keys(fonts).length > 0){
            Logger.warn('Vue-Low-Code: Please add the following font imports:')
        }
        for (let font in fonts) {
            let name = font.replace(', sans-serif', "")
            name = font.replace(/\s+/g, "+")
            Logger.warn(`   <style>@import url('https://fonts.googleapis.com/css2?family=${name}&display=swap');</style>`)
        }
    }

    writeImportStatements (fonts) {
        let head = document.head || document.getElementsByTagName('head')[0];
        for (let font in fonts) {
            /**
             * We make here a request for each font, because if one font fails, it would crash
             * the entire request...
             */
            if (this.fontElement[font]) {
                Logger.log(5, 'FontWriter.write() > Clean up old')
                head.removeChild(this.fontElement[font])
            }
            let name = font.replace(', sans-serif', "")
            name = name.replace(/\s+/g, "+")
            let css = `@import url('https://fonts.googleapis.com/css2?family=${name}&display=swap');`
            let style = document.createElement('style');
            style.type = 'text/css';
            style.appendChild(document.createTextNode(css));
            head.appendChild(style);
            this.fontElement[font] = style
        }
    }

    getFontImportStatement (fonts) {
        let imports = []
        for (let font in fonts) {
            let name = font.replace(/\s+/g, "+")
            //let weight = fonts[font].map(w => `0,${w}`).join(';')
            imports.push(`family=${name}`)
        }
        return `@import url('https://fonts.googleapis.com/css2?${imports.join('&')}&display=swap');`
    }

    getCustomFonts (model) {
        Logger.log(3, 'FontWriter.getCustomFonts() > enter')

        let fonts = {}
        Object.values(model.widgets).forEach(w => {
            if (w.style.fontFamily) {
                let family = w.style.fontFamily
                if (!this.defaultFontFamilies[family]) {
                    if (!fonts[family]) {
                        fonts[family] =[]
                    }
                    fonts[family].push(w.style.fontWeight)
                }
            }
        })

        return fonts
    }
}
export default new FontWriter()