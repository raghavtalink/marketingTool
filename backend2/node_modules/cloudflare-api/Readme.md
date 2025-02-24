#cloudflare-api

This is a npm package that respects the [Cloudflare API Documentation](https://www.cloudflare.com/docs/client-api.html#s2.1) in full

## Usage
```
npm install --save cloudflare-api
```

```javascript
var CloudFlareAPI = require('cloudflare-api');
var cloudflare = new CloudFlareAPI({
	email: '0x4139@gmail.com',
	token: 'test'
});
cloudflare.execute({
    a:'rec_new',
    z:'0x4139.com',
    type:'A',
    name:'test',
    content:'1.2.3.4'
}).then(function(result){
    console.log(result);
}).catch(function(err){
    console.log(err);
})
```

