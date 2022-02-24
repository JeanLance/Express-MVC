/** Base Contains neccessary node package modules (npm) used. Exported from the index file in the base directory (parent dir) */
const base                  = require('..');
const userConfPath          = '../../app/configs/';  // Application configuration path

/** Set the profiler query string upon making interaction(s) with the database */
const ProfilerClass         = require('../libraries/profiler');
const profiler              = new ProfilerClass();

/** Database Configuration Directory */
const dbConfDir             = base.path.join(__dirname, userConfPath, 'database.yaml');

/* Set configuration for database connection (object) */
const dbConf                = base.yaml.load(base.fs.readFileSync(dbConfDir, 'utf8'));

/** Mysql (mysql) package module */
const Mysql                 = base.Mysql;

/** Postgres Promise (pg-promise) package module */
const pgp                   = base.pgp();

/** Available Database drives */
const DatabaseDrivers       = ['mysql', 'postgres'];
const UserConfiguredDriver  = dbConf.database.dbDriver;

/** Object declartion. Will contain connection and database queries */
const Connection            = new Object();

try {
    /** Checks if the user configured database driver is currently not available to the system, or the system doesn't yet offer */
    if (!DatabaseDrivers.includes(UserConfiguredDriver)) {
        throw "Database driver (" + UserConfiguredDriver + ") specified in the config file is currently not avaiable to the framework version.";
    }
}
catch(error) {
    console.log(error);
}

if (UserConfiguredDriver === 'mysql') {
    /** For Mysql connection and the generalized query method */
    Connection['connection'] = Mysql.createConnection(dbConf.database);       // Create a property for the class Model named "connection"
    Connection['connection'].connect( (err) => { if (err) throw err } );      // Connect to the database

    /** Generalize query method (MySql). */

    /** Creates a property for the class Model named "query" (used for generalize database query) */
    Connection['query'] = (query, values) => {
        /** Send the query string to the profiler and store it in a variable  */
        profiler.queryString( Mysql.format( query, values ) );
        
        /** Set the start time of the execution of query */
        profiler.queryStart();

        /* Returns a query promise which will the server will wait (use 'then' or 'async and await') */
        return new Promise((resolve, reject) => {

            /** Mysql query method */
            Connection['connection'].query(query, values, (err, result) => {
                if (err || result == undefined) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
                
                /** Set the time of the execution of the query to calculate it's fetch/write interval (query timeout) */
                profiler.queryEnd();
            });
        });
    }
}
else if (UserConfiguredDriver === 'postgres') {
    /** For Postgres connection and the generalized query method */

    /** Connection string 
     * (Can be an object. 
     * Object = {
     *      username: userName,
     *      password: password,
     *      host: hostName,
     *      port: port,
     *      databasse: databaseName
     *   })
    */
    const connString = 'postgres://'+dbConf.database.user+':'+dbConf.database.password+'@'+dbConf.database.host+':'+dbConf.database.port+'/'+dbConf.database.database;

    Connection['connection'] = pgp( connString );                               // Create a property for the class Model named "connection"
    Connection['connection'].connect( (err) => { if (err) throw err } );      // Connect to the database

    /** Generalize query method (Postgres). */

    /** Creates a property for the class Model named "query" (used for generalize database query) */
    Connection['query'] = async (query, values) => {
        /** Send the query string to the profiler and store it in a variable  */
        profiler.queryString( pgp.as.format( query, values ) );

        /** Set the start time of the execution of query */
        profiler.queryStart();

        /** Await until the response from the database (after query execution) is retrieve */
        let response = await Connection['connection'].query( query, values );

        if (response) {
            /** Set the time of the execution of the query to calculate it's fetch/write interval (query timeout) */
            profiler.queryEnd();
        }

        /** Returns a query promise which will the server will wait (use 'then' or 'async and await') */
        return response;
    }
}

module.exports = Connection;