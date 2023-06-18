import Logger from './Logger'

class RestEngine {

    constructor () {
        this.proxyURL = '/proxy'
    }



    run (request, data, hash, appID) {
        Logger.log(-1, "RestEngine.run()", hash, appID)

        if (request.method === "GET") {
            return this.get(request, data, hash, appID)
        }
        
        if (request.method === "POST" && request.input.type === 'FORM') {
            return this.postOrPutForm(request, data, hash, appID)
        }
        if (request.method === "POST" && request.input.type === 'JSON') {
            return this.postOrPut(request, data, hash, appID)
        }
        if (request.method === "POST" && (request.input.type === 'IMAGE' || request.input.type === 'FILE')) {
            return this.postOrPostImage(request, data, hash, appID)
        }
     
        if (request.method === "PUT" && request.input.type === 'JSON') {
            return this.postOrPut(request, data, hash, appID)
        }
        if (request.method === "PUT" && request.input.type === 'FORM') {
            return this.postOrPutForm(request, data, hash, appID)
        }
        if (request.method === "PUT" && (request.input.type === 'IMAGE' || request.input.type === 'FILE')) {
            return this.postOrPostImage(request, data, hash, appID)
        }

        if (request.method === "DELETE") {
            return this.delete(request, data, hash, appID)
        }
    }



    async buildURL (request, values) {
        let url = await this.fillString(request.url, values, false);
        Logger.log(11, "RestEngine.buildURL()", "exit" ,url)
        return url;
    }

    async buildFormData (request, values) {
        const formData = new FormData()      
        const lines = request.input.template.split('\n')
        for (let line of lines) {
            const parts = line.split(':')
            if (parts.length === 2) {
                const key = parts[0]
                const value = parts[1]
                const data = await this.fillString(value, values, true);
                formData.append(key, data)
            } else {
                throw new Error("RestEngine.buildFormData() > template not ok") 
            }
        }
        Logger.log(-1, "RestEngine.buildFormData()", "exit", formData)
        return formData;
    }

    async buildData (request, values) {

        let data = await this.fillString(request.input.template, values, true);
        Logger.log(1, "RestEngine.buildData()", "exit", data)
        return data;
    }

    async buildToken (request, values) {
        let data = await this.fillString(request.token, values, true);
        Logger.log(1, "RestEngine.buildToken()", "exit", data)
        return data;
    }
    
    async fillString (s, values, encodeFiles = true) {
        for (let key in values) {
            let value = this.getValueByKey(values, key)
            value = await this.getStringFilelValue(value, encodeFiles)
            let pattern = "${" + key + "}"
            s = this.replacePattern(s, pattern, value)
        }
        if (s.indexOf('${') >= 0){
            Logger.log(-1, "RestEngine.fillString()", "> Not all parameters replaced!" + s)
        }
        return s
    }

    fillSimpleString (s, values) {
        let matches = this.getDataBindingVariables(s)
        matches.forEach(key => {
            if (values[key] !== undefined) {
                let value = this.getValueByKey(values, key)
                let pattern = "${" + key + "}"
                s = this.replacePattern(s, pattern, value)
            } else {
                Logger.warn("RestEngine.fillSimpleString()", "Could not find", key)
            }
        })
        return s
    }

    getDataBindingVariables (s) {
        let matches = []
        this.parseString(s, matches)
        return matches
    }

    getValueByKey (values, key) {
        /**
         * Shouldn't this be JSONPath?
         */
        return values[key]
    }

    replacePattern (s, pattern, value) {
        let i = 0
        while (s.indexOf(pattern) >= 0 && i < 100) {
            s = s.replace(pattern, value)
            i++
        }
        return s
    }

    getStringFilelValue (value, encodeFiles) {
        // FIXME: check if we contain ${} to avoid messz stuff
        if (value && value.name && value.size && encodeFiles) {
            value = this.readFileAsBase64(value)
        }
        return value
    }

    async readFileAsBase64 (file) {
        let result = await this.base64(file)
        return result
    }

    dataUrl (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = error => reject(error);
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }

    base64 (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = error => reject(error);
            reader.onload = () => {
                let bytes = Array.from(new Uint8Array(reader.result));
                let base64StringFile = btoa(bytes.map((item) => String.fromCharCode(item)).join(""));
                resolve(base64StringFile);
            }
            reader.readAsArrayBuffer(file);
        });
    }

    handleOutput (resolve, reject, request, response) {
        Logger.log(2, "RestEngine.handleOutput()", "enter" ,response)
     
        if (response.status == 200 || response.status == 201) {
            if (request.output.type === "JSON") {
                try {
                    resolve(response.json())
                } catch (e){
                    reject(new Error(`Could not ${request.method} ${request.url}: ${e.message}`))
                }
            }
            if (request.output.type === "TEXT") {
                resolve(response.text())
            }
            if (request.output.type === "IMAGE") {
                response.arrayBuffer().then((buffer) => {
                    resolve(buffer)
                });
            }
            return;
        }
        reject(Error(`Could not ${request.method} ${request.url}: ${response.statusText}`))
    }

    makeProxyRequestIfNeeded(request, url, headers, hash, appID) {
        if ( this.isProxyRequest(request)) {
            Logger.log(-1, 'RestEngine.makeProxyRequestIfNeeded() > make proxy', hash , appID )
            if (headers) {
                let headerKeys = Object.keys(headers).join(';')       
                headers['x-flowrabbit-headers'] = headerKeys
            }
            headers['x-forwarded-host'] = url
            headers['x-flowrabbit-hash'] = hash
            headers['x-flowrabbit-appid'] = appID
            
            return this.proxyURL
        }
        return url
    }

    get (request, values, hash, appID) {
        return new Promise( async (resolve, reject) => {
            let url = await this.buildURL(request, values)
            let header = await this.createDefaultHeader(request, values)

            url = this.makeProxyRequestIfNeeded(request, url, header, hash, appID)
       
            fetch(url, {
                method: "GET",
                mode: 'cors',
                cache: 'no-cache',
                headers: header,
                redirect: 'follow',
                referrer: 'no-referrer'
            })
            .then(response => {
                this.handleOutput(resolve, reject, request, response)
            }).catch (e => {
                reject(e)
            });
        })
    }

    postOrPostImage (request, values, hash, appID) {
        return new Promise( async (resolve, reject) => {
            let url = await this.buildURL(request, values)
            const header = await this.createDefaultHeader(request, values)
            const formData = new FormData()
            for (let key in values) {
                formData.append(key, values[key])
            }

            url = this.makeProxyRequestIfNeeded(request, url, header, hash, appID)
       
            fetch(url, {
                method: request.method,
                mode: 'cors',
                cache: 'no-cache',
                headers: header,
                redirect: 'follow',
                referrer: 'no-referrer',
                body: formData
            })
            .then(response => {
                this.handleOutput(resolve, reject, request, response)
            }).catch (e => {
                reject(e)
            });
        })
    }

    postOrPutForm (request, values, hash, appID) {
        Logger.log(1, "RestEngine.postOrPutForm()", "enter >")
        return new Promise( async (resolve, reject) => {
            let url = await this.buildURL(request, values)
            const formData = await this.buildFormData(request, values)
            const header = await this.createDefaultHeader(request, values)

            url = this.makeProxyRequestIfNeeded(request, url, header, hash, appID)
       

            fetch(url, {
                method: request.method,
                mode: 'cors',
                cache: 'no-cache',
                headers: header,
                redirect: 'follow',
                referrer: 'no-referrer',
                body: formData
            })
            .then(response => {
                this.handleOutput(resolve, reject, request, response)
            }).catch (e => {
                reject(e)
            });
        })
    }

    postOrPut (request, values, hash, appID) {
        return new Promise( async (resolve, reject) => {

            let url = await this.buildURL(request, values)
            let data = await this.buildData(request, values)
            let header = await this.createDefaultHeader(request, values)

            url = this.makeProxyRequestIfNeeded(request, url, header, hash, appID)
       
            fetch(url, {
                method: request.method,
                mode: 'cors',
                cache: 'no-cache',
                headers: header,
                redirect: 'follow',
                referrer: 'no-referrer',
                body: data
            })
            .then(response => {
                this.handleOutput(resolve, reject, request, response)
            }).catch (e => {
                reject(e)
            });
        })
    }

    delete (request, values, hash, appID) {
        return new Promise( async (resolve, reject) => {
            let url = await this.buildURL(request, values)
            let header = await this.createDefaultHeader(request, values)

            url = this.makeProxyRequestIfNeeded(request, url, header, hash, appID)

            fetch(url, {
                method: "DELETE",
                mode: 'cors',
                cache: 'no-cache',
                headers: header,
                redirect: 'follow',
                referrer: 'no-referrer'
            })
            .then(response => {
                this.handleOutput(resolve, reject, request, response)
            }).catch (e => {
                reject(e)
            });
        })
    }

    getAuthType (request) {
        if (request.authType === 'Bearer') {
            return 'Bearer'
        }
        if (request.authType === 'Basic') {
            return 'Basic'
        }
        return ''
    }

    async createDefaultHeader(request, values) {
        let token = await this.buildToken(request, values)
        let authType= this.getAuthType(request)
        let headers = {}

        if (request.input.type === 'JSON') {
            headers['Content-Type'] = 'application/json'
            headers['Accept'] = 'application/json'
        }

        if (token) {
            headers['Authorization'] = `${authType} ${token}`.trim()
        }

        if (request.headers) {
            request.headers.forEach(header => {
                let key = this.fillSimpleString(header.key, values)
                let value = this.fillSimpleString(header.value, values)
                headers[key] = value
            })
        }

        return headers
    }

    getNeededDataBings (rest) {
        let result = []
        this.parseString(rest.url, result)
        this.parseString(rest.token, result, true)
        if ((rest.method === 'POST' || rest.method === 'PUT') && (rest.input.type === 'JSON' || rest.input.type === 'FORM')) {
            this.parseString(rest.input.template, result)
        }
        if ((rest.method === 'POST' || rest.method === 'PUT') && (rest.input.type === 'FILE' || rest.input.type === 'IMAGE')) {
            if (rest.input.fileDataBinding) {
                result.push(rest.input.fileDataBinding)
            }
        }
        if (rest.headers) {
            rest.headers.forEach(header => {
                this.parseString(header.key, result, true) 
                this.parseString(header.value, result, true) 
            })
        }


        return result;
    }

    parseString (s, result, filterSecrets = false) {
        const matches = s.match(/\$\{(.*?)\}/g)
        if (matches) {
            matches.forEach(m => {
                const variable = m.substring(2, m.length -1)
                if (!this.isScretVariable(variable) || !filterSecrets) {
                    if (result.indexOf(variable) < 0) {
                        result.push(variable)
                    }
                }
            })
        }
    }

    isProxyRequest (request) {
        let isProxy = false
        if (request.token && this.isScretVariable(request.token)) {
            isProxy = true
        }
        if (request.headers) {
            request.headers.forEach(header => {
                if (this.isScretVariable(header.key)) {
                    isProxy = true
                }
                if (this.isScretVariable(header.value)) {
                    isProxy = true
                }
            })
        }
        return isProxy
    }

    isScretVariable (variable) {
        return variable.indexOf('secrets.') >= 0
    }
}
export default new RestEngine()