import * as crypto from 'crypto'
import * as fs from 'fs'
import api from './api'

function fileStatus(filepath: string): Promise<{ md5: string, size: number }> {
    return new Promise(resolve => {
        const stream = fs.createReadStream(filepath)
        const hash = crypto.createHash('md5')
        let size = 0
        stream.on('data', (chunk: Buffer) => {
            size += chunk.byteLength
            hash.update(chunk)
        });
        stream.on('end', () => {
            const md5 = hash.digest('hex')
            resolve({ md5, size })
        });
    })
}

export default {
    getOauthUrl(appKey: string, redirectUrl: string, type: 'code' | 'token') {
        return api.getOauthUrl(appKey, redirectUrl, type)
    },
    getAccessToken(appKey: string, appSecret: string, redirectUrl: string, code: string) {
        return api.getAccessToken(appKey, appSecret, redirectUrl, code)
    },
    getRefreshToken(appKey: string, appSecret: string, refreshToken: string) {
        return api.getRefreshToken(appKey, appSecret, refreshToken)
    },
    getUser(token: string) {
        return api.getUser(token)
    },
    getFileList(token: string, dir: string) {
        return api.getFileList(token, dir)
    },
    async download(token: string, fid: string) {
        let list = await api.getFileDetail(token, [fid])
        return await api.getFileBinary(token, list[0].dlink)
    },
    async upload(token: string, source: string, target: string) {
        const { md5, size } = await fileStatus(source)
        let uploadid = await api.postPrecreate(token, target, size, md5)
        await api.postFileBinary(token, target, uploadid, source)
        return await api.postCreate(token, target, size, md5, uploadid)
    }
}
