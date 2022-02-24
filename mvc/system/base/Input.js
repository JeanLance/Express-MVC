const base                  = require('..');
const userConfPath          = '../../app/configs/';

/** Directory of the 'autoload' configuration file */
const confDir       = base.path.join(__dirname, userConfPath, 'config.yaml');
const config        = base.yaml.load(base.fs.readFileSync(confDir, 'utf8'));

const Profiler = require("../libraries/profiler");
const Output = require("./Output");

let _request;
let _response;
let _next;

class Input {
    constructor() {

    }
    _getHTTP(req, res, next) {
        _request    = req;
        _response   = res;
        _next       = next;

        /** Give the output module the Request and Response (and Next) capabilities */
        new Output()._getHTTP(req, res, next);

        if ( config.profiler_enabled ) {
            new Profiler().startProfiler(req, res, next, new Date().getTime());
        }

        /** Go to the next middleware */
        _next();
    }
    
    /** Session method return the request session variable */
    requestSession() {
        return _request.session;
    }

    request() {
        return _request;
    }
}

module.exports = Input;