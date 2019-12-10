"use strict";

var SpecHelper = require("../specHelper");
var describedClass = require("../../lib/sentient/logger");

describe("Logger", function () {
  beforeEach(function () {
    spyOn(console, "debug");
    spyOn(console, "warn");
    spyOn(console, "error");
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
      describedClass.error("error message");

      expect(SpecHelper.calls(console.debug)).toEqual(["debug message"]);
      expect(SpecHelper.calls(console.warn)).toEqual(["info message"]);
      expect(SpecHelper.calls(console.error)).toEqual(["error message"]);
    });
  });

  describe("info log level", function () {
    beforeEach(function () {
      describedClass.level = "info";
    });

    it("logs info and error messages", function () {
      describedClass.debug("debug message");
      describedClass.info("info message");
      describedClass.error("error message");

      expect(SpecHelper.calls(console.error)).toEqual([
        "error message"
      ]);
    });
  });

  describe("error log level", function () {
    beforeEach(function () {
      describedClass.level = "error";
    });

    it("logs error messages", function () {
      describedClass.debug("debug message");
      describedClass.info("info message");
      describedClass.error("error message");

      expect(SpecHelper.calls(console.error)).toEqual(["error message"]);
    });
  });

  describe("silent log level", function () {
    beforeEach(function () {
      describedClass.level = "silent";
    });

    it("does not log any messages", function () {
      describedClass.debug("debug message");
      describedClass.info("info message");

      expect(SpecHelper.calls(console.warn)).toEqual([]);
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

  describe("custom log function", function () {
    afterEach(function () {
      describedClass.reset();
    });

    it("allows setting a custom log function", function () {
      var messages = [];

      describedClass.log = function (message, level) {
        messages.push([message, level]);
      };

      describedClass.debug("debug message");
      describedClass.info("info message");
      describedClass.error("error message");

      expect(messages).toEqual([
        ["debug message", "debug"],
        ["info message", "info"],
        ["error message", "error"]
      ]);
    });
  });
});
