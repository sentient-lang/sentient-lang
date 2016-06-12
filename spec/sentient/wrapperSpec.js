/* jshint evil:true */

"use strict";

var describedClass = require("../../lib/sentient/wrapper");

describe("Wrapper", function () {
  var subject = describedClass.wrap("myProgram", "foo");
  subject += describedClass.wrap("anotherProgram", "bar");

  describe("when 'module' is defined", function () {
    var module;

    beforeEach(function () {
      module = { exports: {} };
    });

    it("adds the program to module.exports", function () {
      eval(subject);

      expect(module.exports).toEqual({
        myProgram: "foo",
        anotherProgram: "bar"
      });
    });
  });

  describe("when 'window' is defined", function () {
    var window;

    beforeEach(function () {
      window = {};
    });

    it("adds the program to window.Sentient.programs", function () {
      eval(subject);

      expect(window.Sentient.programs).toEqual({
        myProgram: "foo",
        anotherProgram: "bar"
      });
    });
  });
});
