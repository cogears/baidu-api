interface SDK {
    getOauthUrl(appKey: string, redirectUrl: string, type: 'code' | 'token'): string
    getAccessToken(appKey: string, appSecret: string, redirectUrl: string, code: string): Promise<{ accessToken: string, refreshToken: string, expiresIn: number }>
    refreshToken(appKey: string, appSecret: string, refreshToken: string): Promise<{ accessToken: string, refreshToken: string, expiresIn: number }>
    getUser(accessToken: string): Promise<{ uid: string, name: string, avatar: string }>
    getFileList(accessToken: string, dir: string): Promise<Array<{ fid: string, name: string, size: string, path: string, md5: string, lastModifiedTime: number }>>
    download(accessToken: string, fid: string): Promise<any>
    uploadFile(accessToken: string, filepath: string, target: string): Promise<string>
    uploadContent(accessToken: string, content: string, target: string): Promise<string>
}

declare var sdk: SDK

export default sdk