"use strict";

var _ = require("underscore");

var MetadataExtractor = function (program) {
  var self = this;

  self.extract = function () {
    var metadataLines = extractMetadataLines();
    return parseMetadata(metadataLines);
  };

  var extractMetadataLines = function () {
    var lines = program.trim().split("\n");

    var startCapturingMetadata = false;
    var metadataLines = [];

    for (var i = 0; i < lines.length; i += 1) {
      var line = lines[i].trim();

      if (startCapturingMetadata) {
        if (line === "c }") {
          startCapturingMetadata = false;
          break;
        }

        metadataLines.push(line);
      }
      else {
        if (line === "c {") {
          startCapturingMetadata = true;
        }
      }
    }

    if (startCapturingMetadata) {
      var message = "Could not find the end of the metadata";
      throw new Error(message);
    }

    return metadataLines;
  };

  var parseMetadata = function (lines) {
    var json = "";

    lines = _.map(lines, function (line) {
      json += line.replace(/^c/, "");
    });

    json = "{" + json + "}";

    return JSON.parse(json);
  };
};

MetadataExtractor.extract = function (program) {
  return new MetadataExtractor(program).extract();
};

module.exports = MetadataExtractor;
