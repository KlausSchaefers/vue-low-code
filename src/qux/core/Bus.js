class Bus {

    constructor () {
        this.topicListeners = {}
        this._idCounter = 0
        this.TOPIC_LUISA_VALIDATION = 'luisa-validation'
    }

    subscribe (name, callback) {
        if (!this.topicListeners[name]) {
            this.topicListeners[name] = {}
        }
        const id = this._idCounter++
        const listener = {
            'topic': name,
            'callback': callback,
            'id': id,
            'remove': () => {
                this.remove(name, id)
            }
        }
        this.topicListeners[name][id] = listener
        return listener
    }

    remove (name, id) {
        if (this.topicListeners[name]) {
            delete this.topicListeners[name][id] 
        }
    }

    publish (name, data1, data2, data3, data4, data5, data6) {
        if (this.topicListeners[name]) {
            const listeners = this.topicListeners[name]
            Object.values(listeners).forEach(listener => {
                listener.callback(data1, data2, data3, data4, data5, data6)
            })
        }
    }
}

export default new Bus()