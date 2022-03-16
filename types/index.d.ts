declare module 'BaiduApi' {
    function getUser(token: string): Promise<{ uid: string, name: string, avatar: string }>
    function getFileList(token: string, dir: string): Promise<Array<{ fid: string, name: string, size: string, path: string, md5: string, lastModifiedTime: number }>>
    function download(token: string, fid: string): Promise<any>
    function upload(token: string, source: string, target: string): Promise<string>
}

declare module '@cogears/baidu-api' {
    export * from 'BaiduApi'
    export * as default from 'BaiduApi'
}