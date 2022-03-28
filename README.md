# @cogears/baidu-api
百度网盘api


### 安装
```bash
npm install @cogears/baidu-api
```

### 接口列表
- getOauthUrl(appKey: string, redirectUrl: string, type: 'code' | 'token')
- getAccessToken(appKey: string, appSecret: string, redirectUrl: string, code: string)
- refreshToken(appKey: string, appSecret: string, refreshToken: string)
- getUser(accessToken: string)
- getFileList(accessToken: string, dir: string)
- download(accessToken: string, fid: string)
- uploadFile(accessToken: string, filepath: string, target: string)
- uploadContent(accessToken: string, content: string, target: string)
  
详情可查看types定义


### 用例
```typescript
import baiduSdk from '@cogears/baidu-api'

let url = baiduSdk.getOauthUrl($appKey, $redirectUrl)
...


let info = await baiduSdk.getUser($accessToken)
...

```