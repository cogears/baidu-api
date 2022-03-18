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
    refreshToken(appKey: string, appSecret: string, refreshToken: string) {
        return api.refreshToken(appKey, appSecret, refreshToken)
    },
    getUser(accessToken: string) {
        return api.getUser(accessToken)
    },
    getFileList(accessToken: string, dir: string) {
        return api.getFileList(accessToken, dir)
    },
    async download(accessToken: string, fid: string) {
        let list = await api.getFileDetail(accessToken, [fid])
        return await api.getFileBinary(accessToken, list[0].dlink)
    },
    async upload(accessToken: string, source: string, target: string) {
        const { md5, size } = await fileStatus(source)
        let uploadid = await api.postPrecreate(accessToken, target, size, md5)
        await api.postFileBinary(accessToken, target, uploadid, source)
        return await api.postCreate(accessToken, target, size, md5, uploadid)
    }
}
