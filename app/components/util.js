/**
 * Created by jfrodriguez on 8/17/2015.
 */

var Util = function () {

    if (typeof(Number.prototype.toRad) === "undefined") {
        Number.prototype.toRad = function() {
            return this * Math.PI / 180;
        }
    }
    if (typeof(Number.prototype.toDeg) === "undefined") {
        Number.prototype.toDeg = function() {
            return 180 * this / Math.PI;
        }
    }

    this.calculateBearing = function(current, previous) {
        if (!current || !previous)
            return 0;

        var lat1 = current[1].toRad();
        var long1 = current[0].toRad();
        var lat2 = previous[1].toRad();
        var long2 = previous[0].toRad();
        var dLon = long2 - long1;

        var y = Math.sin(dLon) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) -
                Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        var bearing = Math.atan2(y, x).toDeg();

        return (bearing + 360) % 360;
    };

    return this;
};


module.exports = Util;