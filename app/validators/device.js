var ValidatorBase = require('./validatorBase'),
    validatorBase = new ValidatorBase();

var DeviceValidator = function (){
    var self = this;
    validatorBase.schema = {
        code: 'required',
        user: 'required'
    };
    validatorBase.messages = {
        'code.required': 'Code is required',
        'user.required': 'User is required'
    };

    self.validate = validatorBase.validate;
};

module.exports = DeviceValidator;

