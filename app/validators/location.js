var ValidatorBase = require('./validatorBase'),
    validatorBase = new ValidatorBase();

var LocationValidator = function (){
    var self = this;
    validatorBase.schema = {
        coordinates: 'required'
    };
    validatorBase.messages = {
        'coordinates.required': 'Coordinates are required'
    };

    self.validate = validatorBase.validate;
};

module.exports = LocationValidator;

