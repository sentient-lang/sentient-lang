"use strict";

var Macros = function (p) {
  var self = this;

  self.upto = function (args, instructions) {
    validateWidth(args, 3, "upto");

    var start = args[0];
    var stop = args[1];
    var pointer = args[2];

    start = p.preprocess(start);
    stop = p.preprocess(stop);

    validateLiteral(start, 0, "upto");
    validateLiteral(stop, 1, "upto");
    validatePointer(pointer, 2, "upto");

    pointer = pointer.substring(1);

    if (start > stop) {
      var message = "Cannot go from " + start + " up to " + stop + ".";
      message += " Use 'downto' instead.";

      throw new Error(message);
    }

    for (var i = start; i <= stop; i += 1) {
      instructions.push({ type: "constant", value: i });
      instructions.push({ type: "call", name: pointer, width: 1 });
    }
  };

  self.downto = function (args, instructions) {
    validateWidth(args, 3, "downto");

    var start = args[0];
    var stop = args[1];
    var pointer = args[2];

    start = p.preprocess(start);
    stop = p.preprocess(stop);

    validateLiteral(start, 0, "downto");
    validateLiteral(stop, 1, "downto");
    validatePointer(pointer, 2, "downto");

    pointer = pointer.substring(1);

    if (start < stop) {
      var message = "Cannot go from " + start + " down to " + stop + ".";
      message += " Use 'upto' instead.";

      throw new Error(message);
    }

    for (var i = start; i >= stop; i -= 1) {
      instructions.push({ type: "constant", value: i });
      instructions.push({ type: "call", name: pointer, width: 1 });
    }
  };

  self.times = function (args, instructions) {
    validateWidth(args, 2, "times");

    var count = args[0];
    var pointer = args[1];

    count = p.preprocess(count);

    validateLiteral(count, 0, "times");
    validatePointer(pointer, 1, "times");

    pointer = pointer.substring(1);

    if (count <= 0) {
      var message = "Cannot call 'times' with " + count + ". Must be a";
      message += " positive integer.";

      throw new Error(message);
    }

    for (var i = 0; i < count; i += 1) {
      instructions.push({ type: "constant", value: i });
      instructions.push({ type: "call", name: pointer, width: 1 });
    }
  };

  var validateLiteral = function (literal, index, name) {
    if (p.integerLiteral(literal)) {
      return;
    }

    var message = "Called '" + name + "' with '" + literal + "' but '" + name;
    message += "' only supports integer literals (arg #" + index + ")";

    throw new Error(message);
  };

  var validatePointer = function (pointer, index, name) {
    if (p.isFunctionPointer(pointer)) {
      return;
    }

    var message = "Called '" + name + "' with '" + pointer + "' but expected";
    message += " a function (arg #" + index + ")";

    throw new Error(message);
  };

  var validateWidth = function (args, expected, name) {
    var width = args.length;

    if (width === expected) {
      return;
    }

    var message = name + ": wrong number of arguments";
    message += " (given " + width + ", expected " + expected + ")";

    throw new Error(message);
  };
};

module.exports = Macros;
