const http = require('@cogears/http-client')
const domain = 'https://pan.baidu.com/rest/2.0'

class BaiApi extends http.HttpApi {
    constructor() {
        super(domain)
    }

    async postRequest(response, url) {
        response = await super.postRequest(response)
        if (/^https?:\/\/.+?\.baidupcs\.com/i.test(url) || /^https?:\/\/.+?\.pcs\.baidu\.com/i.test(url)) {
            return response
        }
        if (response.errno == 0) {
            return response
        }
        throw new Error(`[api: ${response.errno}] ${url}\n${response.errmsg || ''}`)
    }

    async getUser(token) {
        const { avatar_url, baidu_name, uk } = await this.get('/xpan/nas', { method: 'uinfo', access_token: token })
        return {
            uid: uk,
            name: baidu_name,
            avatar: avatar_url
        }
    }

    async getFileList(token, dir) {
        const query = { method: 'list', access_token: token, dir }
        const { list } = await this.get('/xpan/file', query)
        return list.map(item => ({
            fid: item.fs_id,
            name: item.server_filename,
            path: item.path,
            size: item.size,
            lastModifiedTime: item.server_mtime,
            md5: item.md5,
        }))
    }

    async getFileDetail(token, fsids) {
        fsids = '[' + fsids.join(',') + ']'
        const query = { method: 'filemetas', access_token: token, fsids, dlink: 1 }
        const { list } = await this.get('/xpan/multimedia', query)
        return list.map(item => ({
            fid: item.fs_id,
            name: item.filename,
            path: item.path,
            size: item.size,
            lastModifiedTime: item.server_mtime,
            md5: item.md5,
            dlink: item.dlink,
        }))
    }

    getFileBinary(token, dlink) {
        const headers = { 'User-Agent': 'pan.baidu.com' }
        const query = { access_token: token }
        return this.get(dlink, query, headers)
    }

    async postPrecreate(token, path, size, md5) {
        const query = { method: 'precreate', access_token: token }
        const body = http.form({
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

    postFileBinary(token, path, uploadid, source) {
        path = encodeURIComponent(path)
        const query = { method: 'upload', access_token: token, type: 'tmpfile', path, uploadid, partseq: 0 }
        const file = http.file(source, 'application/octet-stream', 'file')
        return this.post('https://d.pcs.baidu.com/rest/2.0/pcs/superfile2', file, query)
    }

    async postCreate(token, path, size, md5, uploadid) {
        const query = { method: 'create', access_token: token }
        const body = http.form({
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

module.exports = new BaiApi()