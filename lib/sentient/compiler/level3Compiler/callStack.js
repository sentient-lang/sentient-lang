"use strict";

var CallStack = function (array) {
  var self = this;
  array = array || [];

  self.add = function (functionId, functionName) {
    var element = { id: functionId, name: functionName };
    throwIfDuplicate(element);

    var copy = array.slice(0);

    copy.push(element);

    return new CallStack(copy);
  };

  self.toString = function () {
    var strings = [];

    for (var i = 0; i < array.length; i += 1) {
      var element = array[i];
      var string = " " + elementToString(element) + " ";

      strings.push(string);
    }

    padStrings(strings);
    strings.reverse();

    var horizontalRule = Array(strings[0].length + 3).join("-");

    return "|" + strings.join("|\n|") + "|\n" + horizontalRule;
  };

  var throwIfDuplicate = function (element) {
    for (var i = 0; i < array.length; i += 1) {
      if (element.id === array[i].id) {
        var elementString = elementToString(element);

        var message = "Recursive function calls are not supported.";
        message += "\nThe function '" + elementString + "' was called";
        message += " but a function with id=" + element.id + " is already";
        message += " on the call stack:\n\n" + self.toString();

        throw new Error(message);
      }
    }
  };

  var elementToString = function (element) {
    return element.name + " (id=" + element.id + ")";
  };

  var padStrings = function (strings) {
    var maxLength, i, string;

    for (i = 0; i < strings.length; i += 1) {
      string = strings[i];

      if (typeof maxLength === "undefined" || string.length > maxLength) {
        maxLength = string.length;
      }
    }

    for (i = 0; i < strings.length; i += 1) {
      string = strings[i];
      var remainingLength = maxLength - string.length;

      strings[i] += Array(remainingLength + 1).join(" ");
    }
  };
};

module.exports = CallStack;
