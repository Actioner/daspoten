var ValidatorBase = require('./validatorBase'),
    validatorBase = new ValidatorBase();

var DeviceValidator = function (){
    var self = this;
    validatorBase.schema = {
        code: 'required'
    };
    validatorBase.messages = {
        'code.required': 'Code is required'
    };

    self.validate = validatorBase.validate;
};

module.exports = DeviceValidator;

