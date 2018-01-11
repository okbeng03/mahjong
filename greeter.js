"use strict";
exports.__esModule = true;
var a_1 = require("./a");
var myValidator = new a_1.ZipCodeValidator();
function proxify(o) {
    var map = {};
    var _loop_1 = function (i) {
        map[i] = {
            get: function () {
                return o[i];
            },
            set: function (value) {
                o[i] = value;
            }
        };
    };
    for (var i in o) {
        _loop_1(i);
    }
    return map;
}
var o = {
    a: 1,
    b: '2'
};
var proxy = proxify(o);
proxy.a.get();
proxy.a.set(3); // ok
// proxy.a.set('b');   // error: Argument of type '"b"' is not assignable to parameter of type 'number'. 
