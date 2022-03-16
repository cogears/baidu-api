# baidu-api
baidu storage api


### api list

- getUser(token)
- getFileList(token, dir)
- download(token, fid)
- upload(token, source, target)


### example

```javascript
const sdk = require('@cogears/baidu-api')

await sdk.getUser(token)
await sdk.getFileList(token, dir)
await sdk.download(token, fid)
await sdk.upload(token, source, target)

```
