var ValidatorBase = require('./validatorBase'),
    validatorBase = new ValidatorBase();

var SpotValidator = function (){
    var self = this;
    validatorBase.schema = {
        declared: 'required',
        coordinates: 'required'
    };
    validatorBase.messages = {
        'declared.required': 'Declared is required',
        'coordinates.required': 'Coordinates is required'
    };

    self.validate = validatorBase.validate;
};

module.exports = SpotValidator;

