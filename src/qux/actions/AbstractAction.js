import Logger from '../core/Logger'

export default class AbstractAction {

  _get(url, headers = {}) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'get',
            headers: headers
        }).then((res) => {
            if (res.status === 200) {
                res.json().then(j => {
                    Logger.log(6, '_get', 'exit ')
                    resolve(j)
                })
            } else {
              reject(res)
            }
        }).catch((err) => {
            reject(err)
        })
    })
  }

  _post(url, data, headers = {}) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'post',
            body: JSON.stringify(data),
            headers: headers
        }).then((res) => {
            if (res.status === 200) {
                res.json().then(j => {
                    Logger.log(6, 'post', 'exit ')
                    resolve(j)
                })
            } else {
              reject(res)
            }
        }).catch((err) => {
            reject(err)
        })
    })
  }
}