/**
 * Created by vali on 7/8/15.
 */

var Joi = require('joi');

module.exports = {
    constructor: Joi.object().keys({
        email: Joi.string().email().required(),
        token: Joi.string().alphanum().required()
    }).with('email', 'token')
};