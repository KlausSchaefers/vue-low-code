import Logger from './Logger'

class MetaWriter {

    
    write (screen) {
        if (screen.meta) {
            Logger.log(-1, 'MetaWriter.write()', screen.meta)
            this.setMetaTag('description', screen.meta.description)
            this.setMetaTag('keywords', screen.meta.keywords)
        }
    }

    setMetaTag (name, content) {
        try {
            let tag = document.querySelector(`meta[name="${name}"]`)
            if (!tag) {
                let tag = document.createElement('meta')
                document.getElementsByTagName('head')[0].appendChild(tag);
            }
            tag.content = content
        } catch (err){
            Logger.warn('MetaWriter.write() > Could not write metag tag', err)
        }
      
    }

}

export default new MetaWriter()