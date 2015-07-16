var ValidatorBase = require('./validatorBase'),
    validatorBase = new ValidatorBase();

var BearValidator = function (){
    var self = this;
    validatorBase.schema = {
        name: 'required'
    };
    validatorBase.messages = {
        'name.required': 'Name is required'
    };

    self.validate = validatorBase.validate;
};

module.exports = BearValidator;

