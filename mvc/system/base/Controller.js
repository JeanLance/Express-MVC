const base                  = require('..');
const crypto                = require('crypto');
const userConfPath          = '../../app/configs/';


/** Framework's input/request */
const InputModule           = require('./Input');
const input                 = new InputModule();

/** Framework's output/response */
const OutputModule          = require('./Output');
const output                = new OutputModule();

const autoloadConfDir       = base.path.join(__dirname, userConfPath, 'autoload.yaml');
const autoloadConf          = base.yaml.load(base.fs.readFileSync(autoloadConfDir, 'utf8'));            // Set configuration of autoloaded model the user configured

const modelsPath            = '../../app/models/';

class Controller {
    constructor() {
        /** Framework's output/response */
        Controller.prototype.response   = output;
        Controller.prototype.session    = input.requestSession;
        Controller.prototype.request    = input.request;

        if (autoloadConf.models) {
            for (let i = 0; i < autoloadConf.models.length; i++) {
                /** Name of autoloaded model specified by the user (must be the same with file name of model) */
                const modelName = autoloadConf.models[i];

                const modelsDir = base.path.join(__dirname, modelsPath, modelName);
                try {
                    /** Checks if the model file exists */
                    if (base.fs.existsSync( modelsDir + ".js" )) {
                        /** Requires the modulle file of the model */
                        const ImportModel = require( modelsPath + modelName );

                        /** Instantiate the model as class property/variable */
                        Controller.prototype[modelName] = new ImportModel();
                    }
                    else {
                        throw "The file for the model '" + modelName + "' doesn't exists. \nDirectory: " + modelsDir;
                    }
                }
                catch(error) {
                    throw error;
                }
            }
        }
    }

    md5(string) {
        return crypto.createHash('md5').update(string).digest('hex');
    }
}


module.exports = Controller;