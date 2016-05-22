/* jshint maxlen: false */
/* globals document:false */

"use strict";

var Application = function () {
  var self = this;

  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  var numberButton = document.getElementById("numberButton");
  var numberInput = document.getElementById("numberInput");
  var errorSpan = document.getElementById("errorSpan");
  var cache = {};

  self.run = function () {
    compileProgram();
    runProgram();

    buildDigits();
    updateDigits();

    registerHandlers();

    render();
  };

  var runProgram = function () {
    var number = parseInt(numberInput.value, 10);
    errorSpan.innerText = "";

    if (number >= 1 && number <= 999) {
      cache[number] = cache[number] || Sentient.run(self.machineCode, { number: number })[0];
      self.results = cache[number];

      if (typeof self.results.number === "undefined") {
        errorSpan.innerText = "There are no solutions for " + number + ".";
      }
    } else {
      errorSpan.innerText = "Invalid input, number must be between 1 and 999.";
    }
  };

  var buildDigits = function () {
    self.digits = [
      new Digit({ id: "hundreds", x: 25, y: 25 }),
      new Digit({ id: "tens", x: 225, y: 25 }),
      new Digit({ id: "ones", x: 425, y: 25 })
    ];
  };

  var updateDigits = function () {
    for (var i = 0; i < self.digits.length; i += 1) {
      var digit = self.digits[i];
      digit.update(self.results);
    }
  };

  var registerHandlers = function () {
    numberButton.addEventListener("click", function () {
      runProgram();
      updateDigits();
      render();
    });

    numberInput.addEventListener("keydown", function (event) {
      if (event.keyCode === 13) {
        runProgram();
        updateDigits();
        render();
      }
    });

    document.addEventListener("keyup", function (event) {
      if (document.activeElement === numberInput) {
        return;
      }

      var keyCode = event.keyCode;
      var number = parseInt(numberInput.value, 10);

      if (keyCode === 37 && number > 1) {
        event.preventDefault();
        numberInput.value = number - 1;
        numberButton.click();
        render();
      } else if (keyCode === 39 && number < 999) {
        event.preventDefault();
        numberInput.value = number + 1;
        numberButton.click();
        render();
      }
    });
  };

  var render = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < self.digits.length; i += 1) {
      var digit = self.digits[i];
      digit.render(context);
    }
  };

  var compileProgram = function () {
    self.machineCode = Sentient.compile("                                                                                                                                   \n\
      int11 number;                                                                                                                                                         \n\
      invariant number > 0 && number <= 999;                                                                                                                                \n\
                                                                                                                                                                            \n\
      hundreds, remainder = number.divmod(100);                                                                                                                             \n\
      tens, ones = remainder.divmod(10);                                                                                                                                    \n\
                                                                                                                                                                            \n\
      hundreds_visible = number >= 100;                                                                                                                                     \n\
      tens_visible = number >= 10;                                                                                                                                          \n\
      ones_visible = true;                                                                                                                                                  \n\
                                                                                                                                                                            \n\
      hundreds_top_left_visible = hundreds_visible && hundreds != 1;                                                                                                        \n\
      hundreds_top_right_visible = hundreds_visible;                                                                                                                        \n\
      hundreds_middle_left_visible = hundreds_visible && hundreds != 1 && hundreds != 7;                                                                                    \n\
      hundreds_middle_right_visible = hundreds_visible;                                                                                                                     \n\
      hundreds_bottom_left_visible = hundreds_visible && hundreds != 1 && hundreds != 4 && hundreds != 7;                                                                   \n\
      hundreds_bottom_right_visible = hundreds_visible;                                                                                                                     \n\
                                                                                                                                                                            \n\
      tens_top_left_visible = tens_visible && tens != 1;                                                                                                                    \n\
      tens_top_right_visible = tens_visible;                                                                                                                                \n\
      tens_middle_left_visible = tens_visible && tens != 1 && tens != 7;                                                                                                    \n\
      tens_middle_right_visible = tens_visible;                                                                                                                             \n\
      tens_bottom_left_visible = tens_visible && tens != 1 && tens != 4 && tens != 7;                                                                                       \n\
      tens_bottom_right_visible = tens_visible;                                                                                                                             \n\
                                                                                                                                                                            \n\
      ones_top_left_visible = ones_visible && ones != 1;                                                                                                                    \n\
      ones_top_right_visible = ones_visible;                                                                                                                                \n\
      ones_middle_left_visible = ones_visible && ones != 1 && ones != 7;                                                                                                    \n\
      ones_middle_right_visible = ones_visible;                                                                                                                             \n\
      ones_bottom_left_visible = ones_visible && ones != 1 && ones != 4 && ones != 7;                                                                                       \n\
      ones_bottom_right_visible = ones_visible;                                                                                                                             \n\
                                                                                                                                                                            \n\
      hundreds_top_left_top_right_visible = hundreds_visible && hundreds != 1 && hundreds != 4;                                                                             \n\
      hundreds_middle_left_middle_right_visible = hundreds_visible && hundreds != 1 && hundreds != 7 && hundreds != 0;                                                      \n\
      hundreds_bottom_left_bottom_right_visible = hundreds_visible && hundreds != 1 && hundreds != 4 && hundreds != 7;                                                      \n\
      hundreds_top_left_middle_left_visible = hundreds_visible && hundreds != 1 && hundreds != 2 && hundreds != 3 && hundreds != 7;                                         \n\
      hundreds_middle_left_bottom_left_visible = hundreds_visible && hundreds != 1 && hundreds != 3 && hundreds != 4 && hundreds != 5 && hundreds != 7 && hundreds != 9;    \n\
      hundreds_top_right_middle_right_visible = hundreds_visible && hundreds != 5 && hundreds != 6;                                                                         \n\
      hundreds_middle_right_bottom_right_visible = hundreds_visible && hundreds != 2;                                                                                       \n\
                                                                                                                                                                            \n\
      tens_top_left_top_right_visible = tens_visible && tens != 1 && tens != 4;                                                                                             \n\
      tens_middle_left_middle_right_visible = tens_visible && tens != 1 && tens != 7 && tens != 0;                                                                          \n\
      tens_bottom_left_bottom_right_visible = tens_visible && tens != 1 && tens != 4 && tens != 7;                                                                          \n\
      tens_top_left_middle_left_visible = tens_visible && tens != 1 && tens != 2 && tens != 3 && tens != 7;                                                                 \n\
      tens_middle_left_bottom_left_visible = tens_visible && tens != 1 && tens != 3 && tens != 4 && tens != 5 && tens != 7 && tens != 9;                                    \n\
      tens_top_right_middle_right_visible = tens_visible && tens != 5 && tens != 6;                                                                                         \n\
      tens_middle_right_bottom_right_visible = tens_visible && tens != 2;                                                                                                   \n\
                                                                                                                                                                            \n\
      ones_top_left_top_right_visible = ones_visible && ones != 1 && ones != 4;                                                                                             \n\
      ones_middle_left_middle_right_visible = ones_visible && ones != 1 && ones != 7 && ones != 0;                                                                          \n\
      ones_bottom_left_bottom_right_visible = ones_visible && ones != 1 && ones != 4 && ones != 7;                                                                          \n\
      ones_top_left_middle_left_visible = ones_visible && ones != 1 && ones != 2 && ones != 3 && ones != 7;                                                                 \n\
      ones_middle_left_bottom_left_visible = ones_visible && ones != 1 && ones != 3 && ones != 4 && ones != 5 && ones != 7 && ones != 9;                                    \n\
      ones_top_right_middle_right_visible = ones_visible && ones != 5 && ones != 6;                                                                                         \n\
      ones_middle_right_bottom_right_visible = ones_visible && ones != 2;                                                                                                   \n\
                                                                                                                                                                            \n\
      int11 red, yellow, blue;                                                                                                                                              \n\
      colors = [red, yellow, blue];                                                                                                                                         \n\
                                                                                                                                                                            \n\
      invariant red >= 0, yellow >= 0, blue >= 0;                                                                                                                           \n\
      invariant red != yellow, red != blue, yellow != blue;                                                                                                                 \n\
                                                                                                                                                                            \n\
      int3 hundreds_top_left, hundreds_top_right, hundreds_middle_left,                                                                                                     \n\
           hundreds_middle_right, hundreds_bottom_left, hundreds_bottom_right;                                                                                              \n\
                                                                                                                                                                            \n\
      int3 tens_top_left, tens_top_right, tens_middle_left,                                                                                                                 \n\
           tens_middle_right, tens_bottom_left, tens_bottom_right;                                                                                                          \n\
                                                                                                                                                                            \n\
      int3 ones_top_left, ones_top_right, ones_middle_left,                                                                                                                 \n\
           ones_middle_right, ones_bottom_left, ones_bottom_right;                                                                                                          \n\
                                                                                                                                                                            \n\
      invariant hundreds_top_left_top_right_visible ? hundreds_top_left != hundreds_top_right : true;                                                                       \n\
      invariant hundreds_middle_left_middle_right_visible ? hundreds_middle_left != hundreds_middle_right : true;                                                           \n\
      invariant hundreds_bottom_left_bottom_right_visible ? hundreds_bottom_left != hundreds_bottom_right : true;                                                           \n\
      invariant hundreds_top_left_middle_left_visible ? hundreds_top_left != hundreds_middle_left : true;                                                                   \n\
      invariant hundreds_middle_left_bottom_left_visible ? hundreds_middle_left != hundreds_bottom_left : true;                                                             \n\
      invariant hundreds_top_right_middle_right_visible ? hundreds_top_right != hundreds_middle_right : true;                                                               \n\
      invariant hundreds_middle_right_bottom_right_visible ? hundreds_middle_right != hundreds_bottom_right : true;                                                         \n\
                                                                                                                                                                            \n\
      invariant tens_top_left_top_right_visible ? tens_top_left != tens_top_right : true;                                                                                   \n\
      invariant tens_middle_left_middle_right_visible ? tens_middle_left != tens_middle_right : true;                                                                       \n\
      invariant tens_bottom_left_bottom_right_visible ? tens_bottom_left != tens_bottom_right : true;                                                                       \n\
      invariant tens_top_left_middle_left_visible ? tens_top_left != tens_middle_left : true;                                                                               \n\
      invariant tens_middle_left_bottom_left_visible ? tens_middle_left != tens_bottom_left : true;                                                                         \n\
      invariant tens_top_right_middle_right_visible ? tens_top_right != tens_middle_right : true;                                                                           \n\
      invariant tens_middle_right_bottom_right_visible ? tens_middle_right != tens_bottom_right : true;                                                                     \n\
                                                                                                                                                                            \n\
      invariant ones_top_left_top_right_visible ? ones_top_left != ones_top_right : true;                                                                                   \n\
      invariant ones_middle_left_middle_right_visible ? ones_middle_left != ones_middle_right : true;                                                                       \n\
      invariant ones_bottom_left_bottom_right_visible ? ones_bottom_left != ones_bottom_right : true;                                                                       \n\
      invariant ones_top_left_middle_left_visible ? ones_top_left != ones_middle_left : true;                                                                               \n\
      invariant ones_middle_left_bottom_left_visible ? ones_middle_left != ones_bottom_left : true;                                                                         \n\
      invariant ones_top_right_middle_right_visible ? ones_top_right != ones_middle_right : true;                                                                           \n\
      invariant ones_middle_right_bottom_right_visible ? ones_middle_right != ones_bottom_right : true;                                                                     \n\
                                                                                                                                                                            \n\
      hundreds_top_left_value = colors[hundreds_top_left];                                                                                                                  \n\
      hundreds_top_right_value = colors[hundreds_top_right];                                                                                                                \n\
      hundreds_middle_left_value = colors[hundreds_middle_left];                                                                                                            \n\
      hundreds_middle_right_value = colors[hundreds_middle_right];                                                                                                          \n\
      hundreds_bottom_left_value = colors[hundreds_bottom_left];                                                                                                            \n\
      hundreds_bottom_right_value = colors[hundreds_bottom_right];                                                                                                          \n\
                                                                                                                                                                            \n\
      tens_top_left_value = colors[tens_top_left];                                                                                                                          \n\
      tens_top_right_value = colors[tens_top_right];                                                                                                                        \n\
      tens_middle_left_value = colors[tens_middle_left];                                                                                                                    \n\
      tens_middle_right_value = colors[tens_middle_right];                                                                                                                  \n\
      tens_bottom_left_value = colors[tens_bottom_left];                                                                                                                    \n\
      tens_bottom_right_value = colors[tens_bottom_right];                                                                                                                  \n\
                                                                                                                                                                            \n\
      ones_top_left_value = colors[ones_top_left];                                                                                                                          \n\
      ones_top_right_value = colors[ones_top_right];                                                                                                                        \n\
      ones_middle_left_value = colors[ones_middle_left];                                                                                                                    \n\
      ones_middle_right_value = colors[ones_middle_right];                                                                                                                  \n\
      ones_bottom_left_value = colors[ones_bottom_left];                                                                                                                    \n\
      ones_bottom_right_value = colors[ones_bottom_right];                                                                                                                  \n\
                                                                                                                                                                            \n\
      hundreds_total_value = hundreds_top_left_visible ? hundreds_top_left_value : 0;                                                                                       \n\
      hundreds_total_value += hundreds_top_right_visible ? hundreds_top_right_value : 0;                                                                                    \n\
      hundreds_total_value += hundreds_middle_left_visible ? hundreds_middle_left_value : 0;                                                                                \n\
      hundreds_total_value += hundreds_middle_right_visible ? hundreds_middle_right_value : 0;                                                                              \n\
      hundreds_total_value += hundreds_bottom_left_visible ? hundreds_bottom_left_value : 0;                                                                                \n\
      hundreds_total_value += hundreds_bottom_right_visible ? hundreds_bottom_right_value : 0;                                                                              \n\
                                                                                                                                                                            \n\
      tens_total_value = tens_top_left_visible ? tens_top_left_value : 0;                                                                                                   \n\
      tens_total_value += tens_top_right_visible ? tens_top_right_value : 0;                                                                                                \n\
      tens_total_value += tens_middle_left_visible ? tens_middle_left_value : 0;                                                                                            \n\
      tens_total_value += tens_middle_right_visible ? tens_middle_right_value : 0;                                                                                          \n\
      tens_total_value += tens_bottom_left_visible ? tens_bottom_left_value : 0;                                                                                            \n\
      tens_total_value += tens_bottom_right_visible ? tens_bottom_right_value : 0;                                                                                          \n\
                                                                                                                                                                            \n\
      ones_total_value = ones_top_left_visible ? ones_top_left_value : 0;                                                                                                   \n\
      ones_total_value += ones_top_right_visible ? ones_top_right_value : 0;                                                                                                \n\
      ones_total_value += ones_middle_left_visible ? ones_middle_left_value : 0;                                                                                            \n\
      ones_total_value += ones_middle_right_visible ? ones_middle_right_value : 0;                                                                                          \n\
      ones_total_value += ones_bottom_left_visible ? ones_bottom_left_value : 0;                                                                                            \n\
      ones_total_value += ones_bottom_right_visible ? ones_bottom_right_value : 0;                                                                                          \n\
                                                                                                                                                                            \n\
      total = hundreds_total_value + tens_total_value + ones_total_value;                                                                                                   \n\
                                                                                                                                                                            \n\
      invariant total == number;                                                                                                                                            \n\
                                                                                                                                                                            \n\
      expose number, colors,                                                                                                                                                \n\
                                                                                                                                                                            \n\
        hundreds_top_left_visible,                                                                                                                                          \n\
        hundreds_top_right_visible,                                                                                                                                         \n\
        hundreds_middle_left_visible,                                                                                                                                       \n\
        hundreds_middle_right_visible,                                                                                                                                      \n\
        hundreds_bottom_left_visible,                                                                                                                                       \n\
        hundreds_bottom_right_visible,                                                                                                                                      \n\
                                                                                                                                                                            \n\
        tens_top_left_visible,                                                                                                                                              \n\
        tens_top_right_visible,                                                                                                                                             \n\
        tens_middle_left_visible,                                                                                                                                           \n\
        tens_middle_right_visible,                                                                                                                                          \n\
        tens_bottom_left_visible,                                                                                                                                           \n\
        tens_bottom_right_visible,                                                                                                                                          \n\
                                                                                                                                                                            \n\
        ones_top_left_visible,                                                                                                                                              \n\
        ones_top_right_visible,                                                                                                                                             \n\
        ones_middle_left_visible,                                                                                                                                           \n\
        ones_middle_right_visible,                                                                                                                                          \n\
        ones_bottom_left_visible,                                                                                                                                           \n\
        ones_bottom_right_visible,                                                                                                                                          \n\
                                                                                                                                                                            \n\
        hundreds_top_left_top_right_visible,                                                                                                                                \n\
        hundreds_middle_left_middle_right_visible,                                                                                                                          \n\
        hundreds_bottom_left_bottom_right_visible,                                                                                                                          \n\
        hundreds_top_left_middle_left_visible,                                                                                                                              \n\
        hundreds_middle_left_bottom_left_visible,                                                                                                                           \n\
        hundreds_top_right_middle_right_visible,                                                                                                                            \n\
        hundreds_middle_right_bottom_right_visible,                                                                                                                         \n\
                                                                                                                                                                            \n\
        tens_top_left_top_right_visible,                                                                                                                                    \n\
        tens_middle_left_middle_right_visible,                                                                                                                              \n\
        tens_bottom_left_bottom_right_visible,                                                                                                                              \n\
        tens_top_left_middle_left_visible,                                                                                                                                  \n\
        tens_middle_left_bottom_left_visible,                                                                                                                               \n\
        tens_top_right_middle_right_visible,                                                                                                                                \n\
        tens_middle_right_bottom_right_visible,                                                                                                                             \n\
                                                                                                                                                                            \n\
        ones_top_left_top_right_visible,                                                                                                                                    \n\
        ones_middle_left_middle_right_visible,                                                                                                                              \n\
        ones_bottom_left_bottom_right_visible,                                                                                                                              \n\
        ones_top_left_middle_left_visible,                                                                                                                                  \n\
        ones_middle_left_bottom_left_visible,                                                                                                                               \n\
        ones_top_right_middle_right_visible,                                                                                                                                \n\
        ones_middle_right_bottom_right_visible,                                                                                                                             \n\
                                                                                                                                                                            \n\
        hundreds_top_left_value,                                                                                                                                            \n\
        hundreds_top_right_value,                                                                                                                                           \n\
        hundreds_middle_left_value,                                                                                                                                         \n\
        hundreds_middle_right_value,                                                                                                                                        \n\
        hundreds_bottom_left_value,                                                                                                                                         \n\
        hundreds_bottom_right_value,                                                                                                                                        \n\
                                                                                                                                                                            \n\
        tens_top_left_value,                                                                                                                                                \n\
        tens_top_right_value,                                                                                                                                               \n\
        tens_middle_left_value,                                                                                                                                             \n\
        tens_middle_right_value,                                                                                                                                            \n\
        tens_bottom_left_value,                                                                                                                                             \n\
        tens_bottom_right_value,                                                                                                                                            \n\
                                                                                                                                                                            \n\
        ones_top_left_value,                                                                                                                                                \n\
        ones_top_right_value,                                                                                                                                               \n\
        ones_middle_left_value,                                                                                                                                             \n\
        ones_middle_right_value,                                                                                                                                            \n\
        ones_bottom_left_value,                                                                                                                                             \n\
        ones_bottom_right_value;                                                                                                                                            \n\
    ");
  };
};

var Digit = function (params) {
  var self = this;

  self.id = params.id;

  var columns = [params.x, params.x + 100];
  var rows = [params.y, params.y + 100, params.y + 200];

  var nodes = [
    new Node({ id: "top_left", x: columns[0], y: rows[0] }),
    new Node({ id: "top_right", x: columns[1], y: rows[0] }),
    new Node({ id: "middle_left", x: columns[0], y: rows[1] }),
    new Node({ id: "middle_right", x: columns[1], y: rows[1] }),
    new Node({ id: "bottom_left", x: columns[0], y: rows[2] }),
    new Node({ id: "bottom_right", x: columns[1], y: rows[2] })
  ];

  var edges = [
    new Edge({ from: nodes[0], to: nodes[1] }),
    new Edge({ from: nodes[2], to: nodes[3] }),
    new Edge({ from: nodes[4], to: nodes[5] }),
    new Edge({ from: nodes[0], to: nodes[2] }),
    new Edge({ from: nodes[2], to: nodes[4] }),
    new Edge({ from: nodes[1], to: nodes[3] }),
    new Edge({ from: nodes[3], to: nodes[5] })
  ];

  var colors = ["#f55", "yellow", "#5cf"];

  self.render = function (context) {
    var i;

    for (i = 0; i < edges.length; i += 1) {
      var edge = edges[i];
      edge.render(context);
    }

    for (i = 0; i < nodes.length; i += 1) {
      var node = nodes[i];
      node.render(context);
    }
  };

  self.update = function (results) {
    var i, visible, value, id, visibleId, valueId;

    for (i = 0; i < edges.length; i += 1) {
      var edge = edges[i];
      id = self.id + "_" + edge.from.id + "_" + edge.to.id;
      visibleId = id + "_visible";

      visible = results[visibleId];
      edge.visible = visible;
    }

    for (i = 0; i < nodes.length; i += 1) {
      var node = nodes[i];
      id = self.id + "_" + node.id;
      visibleId = id + "_visible";
      valueId = id + "_value";

      visible = results[visibleId];
      value = results[valueId];

      node.visible = visible;
      node.text = value.toString();

      var colorIndex = results.colors.indexOf(value);
      var color = colors[colorIndex];

      node.color = color;
    }
  };
};

var Node = function (params) {
  var self = this;

  self.id = params.id;
  self.x = params.x;
  self.y = params.y;

  self.color = "gray";
  self.text = "123";
  self.visible = true;

  self.render = function (context) {
    if (!self.visible) {
      return;
    }

    context.save();
    context.beginPath();

    context.lineWidth = 5;
    context.arc(self.x, self.y, 20, 0, 2 * Math.PI);
    context.fillStyle = self.color;
    context.fill();
    context.lineWidth = 3;
    context.stroke();

    context.font = "18px Helvetica";
    context.fillStyle = "black";

    var offset;
    if (self.text.length === 1) {
      offset = -5;
    } else if (self.text.length === 2) {
      offset = -10;
    } else {
      offset = -15;
    }

    context.fillText(self.text, self.x + offset, self.y + 7);

    context.closePath();
    context.restore();
  };
};

var Edge = function (params) {
  var self = this;

  self.from = params.from;
  self.to = params.to;
  self.visible = true;

  self.render = function (context) {
    if (!self.visible) {
      return;
    }

    context.save();
    context.beginPath();

    var gradient = context.createLinearGradient(
      self.from.x,
      self.from.y,
      self.to.x,
      self.to.y
    );

    gradient.addColorStop(0, self.from.color);
    gradient.addColorStop(1, self.to.color);
    context.strokeStyle = gradient;

    context.moveTo(self.from.x, self.from.y);
    context.lineTo(self.to.x, self.to.y);
    context.lineWidth = 20;
    context.stroke();

    context.closePath();
    context.restore();
  };
};

window.Application = Application;
