const Connection            = require('../database/Connection');
const crypto                = require('crypto');

/** Framework's input/request */
const InputModule           = require('./Input');
const input                 = new InputModule();

/** Framework's output/response */
const OutputModule          = require('./Output');
const output                = new OutputModule();

const Loaders               = require('./Loader');
const loadedModules         = new Loaders();

class Model {
    constructor() {
        /** Framework's output/response */
        this.response   = output;
        this.session    = input.requestSession;
        this.request    = input.request;

        /** System Libraries */
        for (const key in loadedModules.libraries) {
            this[key] = loadedModules.libraries[key];
        }
    }

    /** Simple generalize query method
     * First argument (query) must contains the query string passed from the model used by users.
     * Second argumnet (values) must contain the values of the query. This is used to avoid SQL injection
     * 
     * Parameters/arguments passed from the user model doesn't neccessarily need to have two arguments,
     * but still recommended to have different paramenter/argument for the query string and the values for
     * security reasons
    */
    query(query, values) {
        return Connection.query(query, values);
    }

    md5(string) {
        return crypto.createHash('md5').update(string).digest('hex');
    }
}

module.exports = Model;