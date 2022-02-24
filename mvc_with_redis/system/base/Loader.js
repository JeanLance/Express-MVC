const base                  = require('..');
const userConfPath          = '../../app/configs/';

/** Directory of the 'autoload' configuration file */
const autoloadConfDir       = base.path.join(__dirname, userConfPath, 'autoload.yaml');
const autoloadConf          = base.yaml.load(base.fs.readFileSync(autoloadConfDir, 'utf8'));            // Set configuration of autoloaded helpers the user configured

class Loader {
    constructor() {
        /** Load all helpers (user helpers or system helpers) in their respective folders/directory
         *  User's helpers directory from the workspace directory ../../app/helpers/
         *  System helpers directory ../helpers/
        */

        /** Load all user and system heleprs 
         * System helpers path (../helpers)
         * User helpers path (../../app/helpers )
        */
        this.helpers            = {};
        this.helpersPath        = {
            user:               base.path.join(__dirname, '../../app/helpers/'),
            system:             base.path.join(__dirname, '../helpers/')
        };

        /** Load all libraries in the libraries folder ../libraries/ */
        this.libraries          = {};
        this.libsDir            = base.path.join(__dirname, '../libraries/');

        
        /** Load the all neccessary modules */
        this._userHelpers();
        this._libraries();
    }

    _userHelpers() {
        /** Set the class property for autoloaded helpers */
        if (autoloadConf.helpers !== null) {
            for (let i = 0; i < autoloadConf.helpers.length; i++) {
                /** Name of autoload helper specified by the user (must be the same with file name of helper) */
                const helperName    = autoloadConf.helpers[i];
    
                /** Users helpers directory */
                const helperDir     = base.path.join(this.helpersPath.user, helperName);
                
                try {
                    /** Checks if the helper file exists */
                    if (base.fs.existsSync( helperDir + ".js" )) {
                        /** Variable for the class import */
                        const ImportHelper          = require(helperDir);

                        /** Instantiate the helper as class property/variable */
                        this.helpers[helperName]    = new ImportHelper();
                    }
                    else {
                        throw "The file for the helper '"+helperName+"' doesn't exists. \nDirectory: "+ this.helpersPath.user;
                    }
                }
                catch(error) {
                    throw error;
                }
            }
        }
    }

    _libraries() {
        /** Libraries directory */
        const libFiles = base.fs.readdirSync(this.libsDir, 'utf8');

        /** Instantiate each library and save to it to the class propery 'libs' */
        libFiles.forEach((file) => {
            /** File name of the library (without extension, assuming that file has no point/dot in its name aside from
             *  the point/dot of the file extension) 
            */
            const fileName  = file.split('.').shift();

            /** Variable for the class import */
            const Library = require( this.libsDir + fileName );

            /** Instantiate the library and save it into class property 'libaries' object */
            this.libraries[fileName] = new Library();
        });
    }
}

module.exports = Loader;