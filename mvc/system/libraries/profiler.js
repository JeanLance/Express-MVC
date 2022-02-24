let _requestArray = [];
let _request;
let _requestStart = [];
let _requestEnd = [];
let _queryStringArray = [];
let _queryExecutionStart = [];
let _queryExecutionEnd = [];
let _allQueryTimeout = 0;

class Profiler {
    startProfiler(req, res, next, timeStart) {
        /** Set the a variable value for the request, response, and next objects passed throught the callback of the method */
        _requestArray.push(req);

        /** Only take the first request for profiling. This is because there might be more request than expected 
         *  (e.g. when redirecting)
         */
        _request        = _requestArray[0];

        /** Only take the time of the first start of request */
        _requestStart.push(timeStart);
    }

    startRequestTimeout(timeStart) {
        _requestStart   = timeStart;
    }

    /** When called and the value passed on the parameter is true, it will produce a variable object which contains all
     *  the neccessary object values from the request object
     */
    enableProfiler(enabled) {
        if (enabled) {
            let profiles = {
                'route':            _request.route,
                'method':           _request.method,
                'originalUrl':      _request.originalUrl,
                'url':              _request.url,
            };

            /** Make an object property for POST if it is a post request */
            if (_request.method === "POST") {
                profiles['postData'] = _request.body
            }

            /** Make an object property if the request needs to query into the database */
            if (_queryStringArray.length !== 0) {
                /** The property of the profiler object for the database queries */
                profiles['DatabaseQuery'] = [];
                
                for (let i = 0; i < _queryExecutionStart.length; i++) {
                    /** Calculate the execution time of the query using the start and end variable set while
                     *  running the query.
                     */
                    let executionTime = (_queryExecutionEnd[i] - _queryExecutionStart[i]) / 1000;

                    /** Add every execution time of every query/queries */
                    _allQueryTimeout += executionTime;

                    profiles['DatabaseQuery'].push({
                        executionTime :     executionTime,
                        queryString:        _queryStringArray[i]
                    });
                }
            }

            /** End of the request */
            _requestEnd = new Date().getTime();
            let FullTimeout = (_requestEnd - _requestStart) / 1000;

            /** Base class timeout or the profiler timeout. The overall timeout of the request minus the time of all added
             *  timeout of queries.
             */
            profiles['BaseClassLoadTimeout']    = Math.round( (FullTimeout - _allQueryTimeout) * 1000 ) / 1000;
            profiles['TotalRequestTimeout']     = FullTimeout;

            // _response.send(JSON.stringify(profiles));
            console.log(profiles);

            /** Clear/reset the profiler varibales */
            this.resetProfilersVariable();
        }
    }

    profiler_route() {
        let output = this.pre_fieldset('009', 'Request Route');
        output += JSON.stringify(_request.route);
        output += '</fieldset>';
        
        return output;
    }

    profiler_method() {
        let output = this.pre_fieldset('080', 'Method');
        output += _request.method;
        output += '</fieldset>';

        return output;
    }

    profiler_get_data() {
        let output = this.pre_fieldset('550', 'GET Data');

        if (Object.keys(_request.query).length === 0) {
            output += 'There are no GET data'
        }
        else {
            output += JSON.stringify(_request.query);
        }
        output += '</fieldset>';

        return output;
    }

    profiler_post_data() {
        let output = this.pre_fieldset('049', 'POST Data');

        if (Object.keys(_request.body).length === 0) {
            output += 'There are no POST data'
        }
        else {
            output += JSON.stringify(_request.body);
        }
        output += '</fieldset>';

        return output;
    }

    profiler_url() {
        let output = this.pre_fieldset('600', 'URI String');
        output += _request.url;
        output += '</fieldset>';

        return output;
    }

    profiler_original_url() {
        let output = this.pre_fieldset('004', 'Original URI String');
        output += _request.originalUrl;
        output += '</fieldset>';

        return output;
    }

    profiler_queries() {
        let output = this.pre_fieldset('505', 'Database Query');

        if (_queryStringArray.length === 0) {
            output += 'There are no database queries';
            output += '</fieldset>';
            return output;
        }
        
        output += '\n\n\n<table style=\"border:none; width:100%;\">\n';

            for (let i = 0; i < _queryExecutionStart.length; i++) {
                /** Calculate the execution time of the query using the start and end variable set while
                 *  running the query.
                 */
                let executionTime = (_queryExecutionEnd[i] - _queryExecutionStart[i]) / 1000;

                /** Add every execution time of every query/queries */
                _allQueryTimeout += executionTime;

                output += '<tr><td style="padding:5px;width:10%;color:#000;font-weight:bold;background-color:#ddd;">';
                output += executionTime + '&nbsp;&nbsp;</td><td style="padding:5px;width:90%;color:#900;font-weight:normal;background-color:#ddd;">';
                output += _queryStringArray[i] + '</td></tr>\n';
            }

        /** Total */
        output += '<tr><td style="padding:5px;width:10%;color:#000;font-weight:bold;background-color:#ddd;">';
        output += 'Total:&nbsp;&nbsp;</td><td style="padding:5px;width:90%;color:#900;font-weight:normal;background-color:#ddd;">';
        output += _allQueryTimeout + '</td></tr>\n';

        output += '</table>\n</fieldset>';

        return output;
    }

    profiler_memory_usage() {
        let output = this.pre_fieldset('987', 'Memory Usage');
        output += process.memoryUsage().heapTotal.toLocaleString() + ' bytes';
        output += '</fieldset>';

        return output;
    }

    profiler_benchmark() {
        let output   = this.pre_fieldset('909', 'Benchmark');

        /** End of the request */
        _requestEnd = new Date().getTime();
        let FullTimeout = (_requestEnd - _requestStart[0]) / 1000;

        output += '\n\n\n<table style=\"border:none; width:100%;\">\n';

        /** Base class timeout or the profiler timeout. The overall timeout of the request minus the time of all added
         *  timeout of queries.
         */
        output += '<tr><td style="padding:5px;width:20%;color:#000;font-weight:bold;background-color:#ddd;">';
        output += 'Base Class Load &nbsp;&nbsp;</td><td style="padding:5px;width:80%;color:#900;font-weight:normal;background-color:#ddd;">';
        output +=  (Math.round( (FullTimeout - _allQueryTimeout) * 1000 ) / 1000) + '</td></tr>\n';

        if (_queryStringArray.length !== 0) {
            output += '<tr><td style="padding:5px;width:20%;color:#000;font-weight:bold;background-color:#ddd;">';
            output += 'Query Duration:&nbsp;&nbsp;</td><td style="padding:5px;width:80%;color:#900;font-weight:normal;background-color:#ddd;">';
            output += _allQueryTimeout + '</td></tr>\n';
        }

        output += '<tr><td style="padding:5px;width:20%;color:#000;font-weight:bold;background-color:#ddd;">';
        output += 'Total Request Timeout &nbsp;&nbsp;</td><td style="padding:5px;width:80%;color:#900;font-weight:normal;background-color:#ddd;">';
        output +=  FullTimeout + '</td></tr>\n';

        
        output += '</table>\n</fieldset>';

        return output;
    }

    pre_fieldset(border_color, legend) {
        return '\n\n<fieldset id="profiler-route" style="width: 95%;border:1px solid #'+border_color+';padding:6px 10px 10px 10px;margin:20px auto 20px;background-color:#eee;">\n<legend style="color:#'+border_color+'; word-wrap: break-word;">&nbsp;&nbsp;'+legend+'&nbsp;&nbsp;</legend>';
    }

    /** Set the database query string */
    queryString(string) {
        _queryStringArray.push(string);
    }

    /** Start time of exucution of query */
    queryStart() {
        _queryExecutionStart.push( new Date().getTime() );
    }

    /** End time of the execution of query */
    queryEnd() {
        _queryExecutionEnd.push( new Date().getTime() );
    }

    /** Clear/reset the global profiler variables value so it won't to other profiler when it is called again */
    resetProfilerVariables() {
        _requestArray           = [];
        _requestStart           = [];
        _queryStringArray       = [];
        _queryExecutionStart    = [];
        _queryExecutionEnd      = [];
        _allQueryTimeout        = 0;
    }
}

module.exports = Profiler;