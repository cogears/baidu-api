const fs = require('fs')
const crypto = require('crypto')
const api = require('./api')

function fileStatus(filepath) {
    return new Promise(resolve => {
        const stream = fs.createReadStream(filepath)
        const hash = crypto.createHash('md5')
        let size = 0
        stream.on('data', chunk => {
            size += chunk.byteLength
            hash.update(chunk, 'utf8')
        });
        stream.on('end', () => {
            const md5 = hash.digest('hex')
            resolve({ md5, size })
        });
    })
}

const sdk = {
    getUser(token) {
        return api.getUser(token)
    },
    getFileList(token, dir) {
        return api.getFileList(token, dir)
    },
    async download(token, fid) {
        let list = await api.getFileDetail(token, [fid])
        return await api.getFileBinary(token, list[0].dlink)
    },
    async upload(token, source, target) {
        const { md5, size } = await fileStatus(source)
        let uploadid = await api.postPrecreate(token, target, size, md5)
        await api.postFileBinary(token, target, uploadid, source)
        return await api.postCreate(token, target, size, md5, uploadid)
    }
}

module.exports = sdk
module.exports.default = sdk