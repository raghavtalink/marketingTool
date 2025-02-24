/**
 * Created by vali on 7/8/15.
 */
'use strict';
var assert = require('assert');
var CloudFlareAPI = require('../');

describe('CloudFlareAPI constructor', function () {
    it('Should crash when a bad email is provided', function (done) {
        try {
            let cloudflare = new CloudFlareAPI({
                email: 'test',
                token: 'test'
            });
            done()
        } catch (err) {
            done()
        }

    });
    it('Should crash when a good email is provided but with an invalid token', function (done) {
        try {
            let cloudflare = new CloudFlareAPI({
                email: '0x4139@gmail.com',
                token: 'test'
            });
            done()
        } catch (err) {
            done();
        }
    });
    it('Should not crash when a good email is provided with an valid token', function (done) {
        try {
            let cloudflare = new CloudFlareAPI({
                email: '0x4139@gmail.com',
                token: '8afbe6dea02407989af4dd4c97bb6e25'
            });
            done()
        } catch (err) {
            console.log(err);
            done(err);
        }
    });
});

describe('CloudflareAPI functions',function(){
    it('Should crash because of an invalid token', function (done) {
        let cloudflare = new CloudFlareAPI({
            email: '0x4139@gmail.com',
            token: '8afbe6dea02407989af4dd4c97bb6e25'
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
            done();
        })
    });
});