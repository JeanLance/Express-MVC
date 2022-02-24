class FormValidations {
    constructor() {
        this.validationMethods  = Object.getOwnPropertyNames(FormValidations.prototype);    // Methods of the class form validation (this class)
        this.validationErrors   = {};
        this.formData;
        this.formName;
        this.methodParam;
    }

    validate(formData, name, validations) {
        try {
            this.formData = formData;
            this.formName = name;

            for (let i = 0; i < validations.length; i++) {
                let validation = validations[i].split("[");
                let method = validation[0];
                
                /** Checks if validation method has a parameter. Example is minLength[5] (5 is in the param) 
                    And if said value in parameter is not a number, throw an error exception message.
                */
                if (validation[1]) {
                    let param = validation[1].split(']').shift();

                    if (parseInt(param)) {
                        this.methodParam = parseInt(param);
                    }
                    else {
                        throw "Parameter in "+method+" is not a number!";
                    }
                }

                /** Checks if the validation method specified by user is part of the form validation class.
                    If not, throw an exception message.
                */
                if (!this.validationMethods.includes(method)) {
                    throw "'" + method + "' is not a form validation method!";
                }
                else {
                    /** delete a validation error if it already existed so it won't be re-called again */
                    delete this.validationErrors[this.formName];

                    /** Call the class form valdiation method */
                    this[method]();
                }
            }
        }
        catch(error) {
            throw error;
        }
    }

    /** Trim unnecessary white spaces/s */
    trim() {
        if (typeof this.formData === "string") {
            this.formData = this.formData.trim();
        }
        else if (typeof this.formData === "object" || Array.isArray(this.formData)) {
            for (let i = 0; i < this.formData.length; i++) {
                this.formData[i] = this.formData[i].trim();
            }
        }
    }


    /** ================ Validations ================ */

    required() {
        if (this.formData === "" || this.formData === null) {
            this.validationErrors[this.formName] = this.formName + " field is required!";
        }
    }

    validEmail() {
        if (!this.formData.includes("@")) {
            this.validationErrors[this.formName] = this.formName + " field requires a valid email!";
        }
    }

    minLength() {
        if (this.formData.length < this.methodParam) {
            this.validationErrors[this.formName] = this.formName + " must have at least " + this.methodParam + " characters!";
        }
    }

    maxLength() {
        if (this.formData.length > this.methodParam) {
            this.validationErrors[this.formName] = this.formName + " cannot exceed " + this.methodParam + " characters.";
        }
    }

    /** Index 1 must match index 0 */
    match() {
        if (this.formData[1] !== this.formData[0]) {
            this.validationErrors[this.formName[1]] = this.formName[1] + " should match " + this.formName[0] + "!";
        }
    }

    /** Method call that determines if there's a validation error */
    hasErrors() {
        return Object.keys(this.validationErrors).length !== 0 ? true : false;
    }

    /** Returns the the class property/variable that contains the errors */
    errors() {
        return this.validationErrors;
    }
}

module.exports = FormValidations;