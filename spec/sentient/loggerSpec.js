"use strict";

var SpecHelper = require("../specHelper");
var describedClass = require("../../lib/sentient/logger");

describe("Logger", function () {
  beforeEach(function () {
    spyOn(console, "log");
  });

  afterEach(function () {
    describedClass.reset();
  });

  it("defaults to the 'silent' log level", function () {
    expect(describedClass.level).toEqual("silent");
  });

  it("persists the log level across requires", function () {
    describedClass.level = "info";
    var Logger = require("../../lib/sentient/logger");

    expect(Logger.level).toEqual("info");
  });

  describe("reset", function () {
    it("sets the log level back to silent", function () {
      describedClass.level = "info";
      describedClass.reset();

      expect(describedClass.level).toEqual("silent");
    });
  });

  describe("debug log level", function () {
    beforeEach(function () {
      describedClass.level = "debug";
    });

    it("logs all messages", function () {
      describedClass.debug("debug message");
      describedClass.info("info message");

      expect(SpecHelper.calls(console.log)).toEqual([
        "debug message",
        "info message"
      ]);
    });
  });

  describe("info log level", function () {
    beforeEach(function () {
      describedClass.level = "info";
    });

    it("logs info messages", function () {
      describedClass.debug("debug message");
      describedClass.info("info message");

      expect(SpecHelper.calls(console.log)).toEqual([
        "info message"
      ]);
    });
  });

  describe("silent log level", function () {
    beforeEach(function () {
      describedClass.level = "silent";
    });

    it("does not log any messages", function () {
      describedClass.debug("debug message");
      describedClass.info("info message");

      expect(SpecHelper.calls(console.log)).toEqual([]);
    });
  });

  describe("unrecognised log level", function () {
    beforeEach(function () {
      describedClass.level = "unrecognised";
    });

    it("throws an error when logging", function () {
      expect(function () {
        describedClass.info("something");
      }).toThrow();
    });
  });
});
