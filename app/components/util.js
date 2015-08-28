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

    this.getDistanceFromLatLonInMt = function (lat1,lon1,lat2,lon2) {
          var R = 6371; // Radius of the earth in km
          var dLat = (lat2-lat1).toRad();  // deg2rad below
          var dLon = (lon2-lon1).toRad(); 
          var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
            ; 
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
          var d = R * c; // Distance in km
          return d*1000;
    };



    return this;
};


module.exports = Util;