import { HttpApi, HttpResponse } from '@cogears/http-client'
const domain = 'https://pan.baidu.com/rest/2.0'

class BaiApi extends HttpApi {
    constructor() {
        super(domain)
    }

    async postRequest(response: HttpResponse, url: string) {
        const result = await super.postRequest(response, url)
        if (/^https?:\/\/.+?\.baidupcs\.com/i.test(url) || /^https?:\/\/.+?\.pcs\.baidu\.com/i.test(url)) {
            return result
        }
        if (url.startsWith('https://openapi.baidu.com/oauth/2.0/token')) {
            return result
        }
        if (result.errno == 0) {
            return result
        }
        throw new Error(`[api: ${result.errno}] ${url}\n${result.errmsg || ''}`)
    }

    getOauthUrl(appKey: string, redirectUrl: string, type: 'code' | 'token', state: string = "sign") {
        return `https://openapi.baidu.com/oauth/2.0/authorize?response_type=${type}&client_id=${appKey}&redirect_uri=${redirectUrl}&scope=basic,netdisk&display=popup&state=${state}`
    }

    async getAccessToken(appKey: string, appSecret: string, redirectUrl: string, code: string) {
        let query = {
            grant_type: 'authorization_code',
            client_id: appKey,
            client_secret: appSecret,
            redirect_uri: redirectUrl,
            code,
        }
        let { access_token, refresh_token, expires_in } = await this.get(`https://openapi.baidu.com/oauth/2.0/token`, query)
        return {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: expires_in
        }
    }

    async refreshToken(appKey: string, appSecret: string, refreshToken: string) {
        let query = {
            grant_type: 'refresh_token',
            client_id: appKey,
            client_secret: appSecret,
            refresh_token: refreshToken,
        }
        let { access_token, refresh_token, expires_in } = await this.get(`https://openapi.baidu.com/oauth/2.0/token`, query)
        return {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: expires_in
        }
    }

    async getUser(token: string) {
        const { avatar_url, baidu_name, uk } = await this.get('/xpan/nas', { method: 'uinfo', access_token: token })
        return {
            uid: uk,
            name: baidu_name,
            avatar: avatar_url
        }
    }

    async getFileList(token: string, dir: string) {
        const query = { method: 'list', access_token: token, dir }
        const { list } = await this.get('/xpan/file', query)
        return list.map((item: any) => ({
            fid: item.fs_id,
            name: item.server_filename,
            path: item.path,
            size: item.size,
            lastModifiedTime: item.server_mtime,
            md5: item.md5,
        }))
    }

    async getFileDetail(token: string, fsids: string[]) {
        const ids = '[' + fsids.join(',') + ']'
        const query = { method: 'filemetas', access_token: token, fsids: ids, dlink: 1 }
        const { list } = await this.get('/xpan/multimedia', query)
        return list.map((item: any) => ({
            fid: item.fs_id,
            name: item.filename,
            path: item.path,
            size: item.size,
            lastModifiedTime: item.server_mtime,
            md5: item.md5,
            dlink: item.dlink,
        }))
    }

    getFileBinary(token: string, dlink: string) {
        const headers = { 'User-Agent': 'pan.baidu.com' }
        const query = { access_token: token }
        return this.get(dlink, query, headers)
    }

    async postPrecreate(token: string, path: string, size: number, md5: string) {
        const query = { method: 'precreate', access_token: token }
        const body = HttpApi.form({
            path,
            size,
            isdir: 0,
            autoinit: 1,
            rtype: 3,
            block_list: '["' + md5 + '"]',
        })
        const { uploadid } = await this.post('/xpan/file', body, query)
        return uploadid
    }

    postFileBinary(token: string, path: string, uploadid: string, source: string) {
        path = encodeURIComponent(path)
        const query = { method: 'upload', access_token: token, type: 'tmpfile', path, uploadid, partseq: 0 }
        const file = HttpApi.file('file', source)
        return this.post('https://d.pcs.baidu.com/rest/2.0/pcs/superfile2', file, query)
    }

    async postCreate(token: string, path: string, size: number, md5: string, uploadid: string) {
        const query = { method: 'create', access_token: token }
        const body = HttpApi.form({
            path,
            size,
            isdir: 0,
            rtype: 3,
            uploadid,
            block_list: '["' + md5 + '"]',
        })
        const { fs_id } = await this.post('/xpan/file', body, query)
        return fs_id
    }
}

export default new BaiApi()