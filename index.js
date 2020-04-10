var jwt = require('jsonwebtoken');
var request = require('request');

class InfobotYandexTTS {
    constructor(serviceAccountID, keyID, folderID, keyData) {
        this.serviceAccountID = serviceAccountID;
        this.keyID = keyID;
        this.folderID = folderID;
        this.keyData = keyData;
        this.token = null;

        if (!this.serviceAccountID) throw new Error('No Service Account ID provided');
        if (!this.keyID) throw new Error('No Service Key ID provided');
        if (!this.folderID) throw new Error('No Folder ID provided');
        if (!this.keyData) throw new Error('No Private Key provided');
    }

    generateToken() {
        const self = this;
        return new Promise(function (resolve, reject) {
            if (!(self.token && self.tokenExpire && self.tokenExpire < Math.floor(new Date() / 1000))) {
                const expire = Math.floor(new Date() / 1000) + 60;

                const payload = {
                    'aud': 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
                    'iss': self.serviceAccountID,
                    'iat': Math.floor(new Date() / 1000),
                    'exp': expire
                };

                const tokenJWT = jwt.sign(payload, self.keyData, {
                    algorithm: 'PS256',
                    keyid: self.keyID
                });

                request.post(
                    'https://iam.api.cloud.yandex.net/iam/v1/tokens',
                    {json: {jwt: tokenJWT}},
                    function (error, response, body) {
                        if (!error && parseInt(response.statusCode) === 200) {
                            self.token = body.iamToken;
                            self.tokenExpire = expire;
                            resolve(self.token);
                        } else {
                            reject(error);
                        }
                    }
                );
            } else {
                resolve(self.token);
            }
        });
    }

    generateAudio(text, params) {
        const self = this;
        return new Promise(function (resolve, reject) {
            if (!text) reject('No text specified');
            self.generateToken().then(function () {
                params.format = params.format || 'oggopus';
                params.sampleRate = params.sampleRate || 48000;
                params.emotion = params.emotion || 'neutral';
                params.speed = params.speed || 1.0;
                params.ssml = params.ssml || false;
                params.language = params.language || 'ru-RU';

                var data = {
                    voice: params.voice,
                    emotion: params.emotion,
                    format: params.format,
                    folderId: self.folderID,
                    sampleRateHertz: params.sampleRate,
                    speed: params.speed,
                    lang: params.language
                };

                if (params.ssml) {
                    data['ssml'] = text;
                } else {
                    data['text'] = text;
                }

                request.post(
                    'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize',
                    {
                        headers: {
                            'Authorization': 'Bearer ' + self.token
                        },
                        form: data,
                        encoding: null
                    },
                    function (error, response, body) {
                        if (!error && response.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    }
                );
            }).catch(function (err) {
                reject(err);
            });
        });
    }
}

module.exports = InfobotYandexTTS;