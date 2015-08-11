var ValidatorBase = require('./validatorBase'),
    validatorBase = new ValidatorBase();

var LocationValidator = function (){
    var self = this;
    validatorBase.schema = {
        lat: 'required|min:-90|max:90',
        lng: 'required|min:-180|max:180'
    };
    validatorBase.messages = {
        'lat.required': 'Latitude is required',
        'lng.required': 'Longitude is required'
    };

    self.validate = validatorBase.validate;
};

module.exports = LocationValidator;

