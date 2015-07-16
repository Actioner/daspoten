/**
 * Created by jfrodriguez on 7/15/2015.
 */
var Indicative = require('indicative');

var ValidatorBase = function (){
    var self = this;
    self.indicative = new Indicative();

    self.validate = function (entity, valid, invalid) {
        if (typeof(self.schema) == "undefined" || typeof(self.messages) == "undefined") {
            throw new Error("schema and messages required to validate");
        }
        var stub = entity.toObject();
        self.indicative
            .validate(self.schema, stub, self.messages)
            .then(function(data){
                valid(data);
            })
            .catch(function(error){
                invalid(error);
            });
    }
};

module.exports = ValidatorBase;

// validating fixtures data using defined schema rule
// @note - Indicative validate method returns a promise

