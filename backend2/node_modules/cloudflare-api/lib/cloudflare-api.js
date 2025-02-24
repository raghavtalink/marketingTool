'use strict';
var request = require('request');
var Joi = require('joi');
var schemas = require('./schemas');

function CloudflareAPI(opts) {
    Joi.validate(opts, schemas.constructor, function (err) {
        if (err) {
            throw err;
        } else {
            this.opts = opts
        }
    }.bind(this))
}

CloudflareAPI.prototype.execute = function (opts) {
    if (!opts) {
        throw new Error('[cloudflare] options cannot be empty or null');
    }
    if(!opts.a){
        throw new Error('[a (action) parameter] cannot be empty or null');
    }
    opts.tkn = this.opts.token;
    opts.email = this.opts.email;
    return new Promise(function (resolve, reject) {
        request.post({
            url: 'https://www.cloudflare.com/api_json.html',
            form: opts
        }, function (err, httpResponse, body) {
            if (err) {
                reject(err);
            }
            let result = JSON.parse(body);
            if (result.result === 'error') {
                reject(new Error(result.msg));
            }
            resolve(JSON.parse(body));
        })
    });
};
module.exports = CloudflareAPI;