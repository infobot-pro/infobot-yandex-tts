# infobot-yandex-tts
Node.JS library for [Yandex Speech Cloud](https://cloud.yandex.ru/docs/speechkit/tts/) service.
Library can be used to generate audio files from text with TTS service.

To work with this library you need to obtain from Yandex Cloud:
* Private key in PEM format
* Service ID
* Service Key
* Folder ID

Please check [this page](https://cloud.yandex.ru/docs/iam/operations/sa/create) for information about service accounts.

## Audio file generation example:
```javascript
const TTS = require('infobot-yandex-tts');
const fs = require('fs');

const key = SERVICE_KEY ;
const folder_id = FOLDER_ID;
const service_id = SERVICE_ID;

const tts = new TTS(service_id, key, folder_id, fs.readFileSync('./yandex.pem'));
tts.generateAudio('Привет, это тест. А меня зовут Алёна.', {
    voice: 'alena'
}).then(res => {
    fs.writeFileSync('out.ogg', res);
}).catch(err => {
    console.error(err);
});
````

Provided by [INFOBOT LLC.](https://infobot.pro) under ISC license.

