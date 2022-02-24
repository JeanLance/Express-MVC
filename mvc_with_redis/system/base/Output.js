const base                  = require('..');
const userConfPath          = '../../app/configs/';

const ProfilerClass         = require('../libraries/profiler');
const profiler              = new ProfilerClass();

/** Directory of the 'autoload' configuration file */
const confDir       = base.path.join(__dirname, userConfPath, 'config.yaml');
const config        = base.yaml.load(base.fs.readFileSync(confDir, 'utf8'));

let _request;
let _response;
let _next;

class Output {
    _getHTTP(req, res, next) {
        _request    = req;
        _response   = res;
        _next       = next;
    }

    /** view output */
    view(file, data) {
        if (arguments === null || arguments.length === 0) {
            throw "Passed arguments are invalid or not defined!";
        }

        let htmlString = "";

        if ( Array.isArray(arguments[0]) ) {
            for(let i = 0; i < arguments.length; i++) {
                /** Arguments are expected to be array with two elements on each 
                 *  ([view, data]) View File Name and the Data to be sent on that view file
                */
                _response.render(arguments[i][0], arguments[i][1], (error, html) => {
                    htmlString += html + "\n";
                });
            }
        }
        else {
            _response.render(arguments[0], arguments[1], (error, html) => {
                htmlString += html;
            });
        }

        if ( ! config.profiler_enabled) {
            _response.send(htmlString);
        }
        else {
            this.viewWithProfiler(htmlString);
        }
    }

    viewWithProfiler(html) {
        let output = "\n\n";
        output += profiler.profiler_route();
        output += profiler.profiler_method();
        output += profiler.profiler_get_data();
        output += profiler.profiler_post_data();
        output += profiler.profiler_url();
        output += profiler.profiler_original_url();
        output += profiler.profiler_queries();
        output += profiler.profiler_memory_usage();
        output += profiler.profiler_benchmark();

        profiler.resetProfilerVariables();

        html += output;
        _response.send(html);
    }

    /** Response methods (some are still not set). These are on beta mode only so it might be changed or can be
     *  moved to another class.
     */

    /** .render(view [, locals] [, callback]) */
    render(file, data = {}) {
        _response.render(file, data);
        return this;
    }

    redirect(url) {
        _response.redirect(url);
    }

    /** .download(path [, filename] [, options] [, fn]) */
    download(path, fileName = "", options ,callback) {
        _response.download(path, fileName, options, callback());
        return this;
    }

    /** .send([body]) */
    send(content) {
        _response.send(content);
        return this;
    }

    /** .sendFile(path [, options] [, fn]) */
    sendFile(path, options, callback) {
        _response.sendFile(path, options, callback())
    }

    /** .sendStatus(statusCode) */
    sendStatus(status) {
        _response.sendStatus(status);
        return this;
    }

    /** .set(field [, value]) */
    set(field, value) {
        _response.set(field, value);
    }

    /** .status(code) */
    status(status) {
        _response.status(status);
        return this;
    }

    /** .write(chunk[, encoding][, callback]) */
    write(content, encoding, callback) {
        _response.write(content);
        return this;
    }

    /** .writeHead(code [, content-type]) */
    writeHead(statusCode, contentType) {
        _response.writeHead(statusCode, contentType)
        return this;
    }
}

module.exports = Output;