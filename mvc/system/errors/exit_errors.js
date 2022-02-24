class ExitErrors {
    controllerUnknownMethod(req, res) {
        res.send('Controller route method is unknown/undfined!');
    }
}

module.exports = new ExitErrors;