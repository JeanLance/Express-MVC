const base              = require('..');                // Importing modules using imported modules of the index.js in the parent directory
const express           = require('express');           // Import express package module

const InputClass = require('../base/Input');
const input = new InputClass();

const Router            = express.Router();             // access express router
const controllerPath    = "../../app/controllers/";     // Path to the controllers folder

// Router.use(input.dis);

try {
    let controllerImports   = new Object();
    const routesConfigDir   = base.path.join(__dirname, '../../app/configs/routes.yaml');           // Full directory of the routes configuration set
    const routesConfig      = base.yaml.load(base.fs.readFileSync(routesConfigDir, 'utf8'));        // returns a object containing the url for the controller methods

    /** Loops through controllers set in the routes conbfig file */
    for (const controller in routesConfig) {
        let configRoutesObject  = routesConfig[controller];                                         // The url for the controller method (object key)
        let controllersDir      = base.path.join(__dirname, controllerPath, controller);            // Full directory path of the controlelrs

        if (base.fs.existsSync( controllersDir + ".js")) {
            controllerImports[controller] = require( controllerPath + controller );                 // Imports the controller module class

            let controllerClass = new controllerImports[controller];                                // Instantiates the controller class so it's methods will be used for the router ( as the route target )
            let methods  = Object.getOwnPropertyNames(controllerImports[controller].prototype);     // Methods of the class form validation (this class)

            /** Loops through the controller's config url and keys (controller methods) */
            for (const url in configRoutesObject) {
                let classMethod = configRoutesObject[url];

                if (methods.includes(classMethod)) {                                                // Checks if the user configured target method of the class is not existent or not specified
                    /** Creates a router for the specified url targeting class method
                     *  Parameter: URL string, Profiler callback, Controller method callback 
                    */
                    // Router.use(url, input.dis);
                    Router.all( 
                        url, 
                        input._getHTTP,
                        controllerClass[ classMethod ]
                    );
                }
                else {
                    throw "Method '" + classMethod + "' doesn't exist in the controller class '" + controller + "'";
                }
            }
        }
        else {
            throw "The file for the controller '" + controller + "' doesn't exists";
        }
    }

} catch (error) {
    console.log(error);
}

module.exports = Router;