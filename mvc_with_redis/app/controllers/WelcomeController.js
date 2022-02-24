const Controller = require('../../system/base/Controller');

class WelcomeController extends Controller {
    constructor() {
        super();
    }

    welcome() {
        super.response.view('welcome_page');
    }
}

module.exports = WelcomeController;