"use strict";

var Application = function () {
  var self = this;

  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");

  self.run = function () {
    buildTiles();
    buildArrows();
    buildAbstractionLines();
    buildTextArea();
    buildControls();
    buildAnimation();

    registerClickHandler();

    render();
  };

  var buildTiles = function () {
    var yellow = "#FFDB58";
    var blue = "#A6E7FF";
    var green = "#77DD77";
    var red = "#FE4164";
    var pink = "#F1A7FE";
    var orange = "#FFC87C";

    self.tiles = [
      new Tile({ id: "source-code",    text: "Source Code",    color: yellow, x: 210, y: 30,  textX: 20 }),
      new Tile({ id: "l3-compiler",    text: "L3 Compiler",    color: blue,   x: 210, y: 120, textX: 25 }),
      new Tile({ id: "l2-compiler",    text: "L2 Compiler",    color: blue,   x: 210, y: 270, textX: 25 }),
      new Tile({ id: "l1-compiler",    text: "L1 Compiler",    color: blue,   x: 210, y: 420, textX: 25 }),
      new Tile({ id: "machine-code-1", text: "Machine Code",   color: yellow, x: 210, y: 510, textX: 15 }),
      new Tile({ id: "l2-code",        text: "L2 Code",        color: yellow, x: 20,  y: 195, textX: 45 }),
      new Tile({ id: "l1-code",        text: "L1 Code",        color: yellow, x: 20,  y: 345, textX: 45 }),
      new Tile({ id: "l3-runtime",     text: "L3 Runtime",     color: green,  x: 705, y: 120, textX: 30 }),
      new Tile({ id: "l2-runtime",     text: "L2 Runtime",     color: green,  x: 705, y: 270, textX: 30 }),
      new Tile({ id: "l1-runtime",     text: "L1 Runtime",     color: green,  x: 705, y: 420, textX: 30 }),
      new Tile({ id: "machine",        text: "Machine",        color: red,    x: 705, y: 570, textX: 40 }),
      new Tile({ id: "sat-solver",     text: "SAT Solver",     color: red,    x: 705, y: 660, textX: 30 }),
      new Tile({ id: "assignments",    text: "Assignments",    color: pink,   x: 585, y: 30,  textX: 20 }),
      new Tile({ id: "l2-assignments", text: "L2 Assignments", color: pink,   x: 515, y: 195, textX: 10 }),
      new Tile({ id: "l1-assignments", text: "L1 Assignments", color: pink,   x: 515, y: 345, textX: 10 }),
      new Tile({ id: "machine-code-2", text: "Machine Code",   color: yellow, x: 515, y: 495, textX: 15 }),
      new Tile({ id: "results",        text: "Results",        color: orange, x: 835, y: 30,  textX: 45 }),
      new Tile({ id: "l2-results",     text: "L2 Results",     color: orange, x: 895, y: 195, textX: 35 }),
      new Tile({ id: "l1-results",     text: "L1 Results",     color: orange, x: 895, y: 345, textX: 35 }),
      new Tile({ id: "solution",       text: "Solution",       color: orange, x: 895, y: 495, textX: 45 }),
    ];
  };

  var buildArrows = function () {
    self.arrows = [
      new Arrow({ startX: 290, startY: 80,  endX: 290, endY: 110, from: "source-code",    to: "l3-compiler" }),
      new Arrow({ startX: 200, startY: 155, endX: 165, endY: 185, from: "l3-compiler",    to: "l2-code" }),
      new Arrow({ startX: 165, startY: 240, endX: 200, endY: 270, from: "l2-code",        to: "l2-compiler" }),
      new Arrow({ startX: 200, startY: 305, endX: 165, endY: 335, from: "l2-compiler",    to: "l1-code" }),
      new Arrow({ startX: 165, startY: 390, endX: 200, endY: 420, from: "l1-code",        to: "l1-compiler" }),
      new Arrow({ startX: 290, startY: 470, endX: 290, endY: 500, from: "l1-compiler",    to: "machine-code-1" }),
      new Arrow({ startX: 730, startY: 80,  endX: 730, endY: 110, from: "assignments",    to: "l3-runtime" }),
      new Arrow({ startX: 695, startY: 155, endX: 660, endY: 185, from: "l3-runtime",     to: "l2-assignments" }),
      new Arrow({ startX: 660, startY: 240, endX: 695, endY: 270, from: "l2-assignments", to: "l2-runtime" }),
      new Arrow({ startX: 695, startY: 305, endX: 660, endY: 335, from: "l2-runtime",     to: "l1-assignments" }),
      new Arrow({ startX: 660, startY: 390, endX: 695, endY: 420, from: "l1-assignments", to: "l1-runtime" }),
      new Arrow({ startX: 695, startY: 455, endX: 660, endY: 485, from: "l1-runtime",     to: "machine-code-2" }),
      new Arrow({ startX: 660, startY: 540, endX: 695, endY: 570, from: "machine-code-2", to: "machine" }),
      new Arrow({ startX: 750, startY: 620, endX: 750, endY: 650, from: "machine",        to: "sat-solver" }),
      new Arrow({ startX: 820, startY: 650, endX: 820, endY: 620, from: "sat-solver",     to: "machine" }),
      new Arrow({ startX: 875, startY: 570, endX: 910, endY: 540, from: "machine",        to: "solution" }),
      new Arrow({ startX: 910, startY: 485, endX: 875, endY: 455, from: "solution"  ,     to: "l1-runtime" }),
      new Arrow({ startX: 875, startY: 420, endX: 910, endY: 390, from: "l1-runtime",     to: "l1-results" }),
      new Arrow({ startX: 910, startY: 335, endX: 875, endY: 305, from: "l1-results",     to: "l2-runtime" }),
      new Arrow({ startX: 875, startY: 270, endX: 910, endY: 240, from: "l2-runtime",     to: "l2-results" }),
      new Arrow({ startX: 910, startY: 185, endX: 875, endY: 155, from: "l2-results",     to: "l3-runtime" }),
      new Arrow({ startX: 850, startY: 110, endX: 850, endY: 80,  from: "l3-runtime",     to: "results"  }),
    ];
  };

  var buildAbstractionLines = function () {
    self.abstractionLines = [
      new AbstractionLine({ text: "Level 3 Abstraction", y: 145 }),
      new AbstractionLine({ text: "Level 2 Abstraction", y: 295 }),
      new AbstractionLine({ text: "Level 1 Abstraction", y: 445 })
    ];
  };

  var buildTextArea = function () {
    self.textArea = new TextArea();
  };

  var buildControls = function () {
    self.controls = [
      new Control({ id: "next", x: 595, y: 695, direction: 1 }),
      new Control({ id: "previous", x: 575, y: 695, direction: -1 }),
    ];
  };

  var buildAnimation = function () {
    self.animation = new Animation({
      arrows: self.arrows,
      tiles: self.tiles
    });
  };

  var registerClickHandler = function () {
    canvas.addEventListener("click", function (event) {
      var x, y;

      if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
      }
      else {
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }

      x -= canvas.offsetLeft;
      y -= canvas.offsetTop;

      handleClick(x, y)
    });
  };

  var handleClick = function (x, y) {
    for (var i = 0; i < self.tiles.length; i += 1) {
      var tile = self.tiles[i];

      if (tile.contains(x, y)) {
        handleTileClick(tile);
        return;
      }
    }

    for (var i = 0; i < self.controls.length; i += 1) {
      var control = self.controls[i];

      if (control.contains(x, y)) {
        handleControlClick(control);
        return;
      }
    }
  };

  var handleTileClick = function (tile) {
    // NOOP
  };

  var handleControlClick = function (control) {
    if (control.id === "next") {
      self.animation.nextFrame();
      render();
    } else if (control.id === "previous") {
      self.animation.previousFrame();
      render();
    }
  };

  var render = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);

    var frame = self.animation.getFrame();

    for (var i = 0; i < self.tiles.length; i += 1) {
      var tile = self.tiles[i];

      if (frame.selectedTiles.indexOf(tile) !== -1) {
        tile.selected = true;
      } else {
        tile.selected = false;
      }

      tile.render(context);
    }

    for (var i = 0; i < self.arrows.length; i += 1) {
      var arrow = self.arrows[i];

      if (arrow === frame.selectedArrow) {
        arrow.selected = true;
      } else {
        arrow.selected = false;
      }

      arrow.render(context);
    }

    for (var i = 0; i < self.abstractionLines.length; i += 1) {
      var abstractionLine = self.abstractionLines[i];
      abstractionLine.render(context);
    }

    self.textArea.text = frame.text;
    self.textArea.render(context);

    for (var i = 0; i < self.controls.length; i += 1) {
      var control = self.controls[i];
      control.render(context);
    }
  };
};

var Tile = function (params) {
  var self = this;
  self.id = params.id;
  self.text = params.text;

  var width = 160;
  var height = 38;
  var textY = 27;

  self.render = function (context) {
    var borderThickness = 1;
    var borderColor = "black";

    if (self.selected) {
      borderThickness = 4;
      borderColor = "blue";
    }

    context.save();
    context.beginPath();
    context.rect(params.x, params.y, width, height);
    context.fillStyle = params.color;
    context.fill();
    context.lineWidth = borderThickness;
    context.strokeStyle = borderColor;
    context.stroke();

    context.font = "20px Helvetica";
    context.fillStyle = "black";
    context.fillText(params.text, params.x + params.textX, params.y + textY);
    context.closePath();
    context.restore();
  };

  self.contains = function (x, y) {
    if (x >= params.x && x <= params.x + width && y >= params.y && y <= params.y + height) {
      return true;
    }

    return false;
  };
};

var Arrow = function (params) {
  var self = this;

  self.from = params.from;
  self.to = params.to;

  self.render = function (context) {
    var x2 = Math.pow(params.endX - params.startX, 2);
    var y2 = Math.pow(params.endY - params.startY, 2);
    var hypotenuse = Math.sqrt(x2 + y2);
    var angle = Math.acos((params.endY - params.startY) / hypotenuse);

    if (params.endX < params.startX) {
      angle = 2 * Math.PI - angle;
    }

    var lineWidth = 2;
    var color = "black";

    if (self.selected) {
      lineWidth = 4;
      color = "blue";
    }

    context.save();
    context.beginPath();
    context.lineWidth = lineWidth;
    context.moveTo(params.startX, params.startY);
    context.lineTo(params.endX, params.endY);
    context.strokeStyle = color;
    context.stroke();
    context.beginPath();
    context.translate(params.endX, params.endY);
    context.rotate(-angle);
    context.moveTo(0, -3);
    context.lineTo(-3, -3);
    context.lineTo(0, 0);
    context.lineTo(3, -3);
    context.lineTo(0, -3);
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
  };
};

var AbstractionLine = function (params) {
  var self = this;

  self.render = function (context) {
    context.save();
    context.beginPath();
    context.lineWidth = 3;
    context.strokeStyle = "#ddd";
    context.setLineDash([6, 4]);
    context.moveTo(385, params.y);
    context.lineTo(690, params.y);
    context.stroke();

    context.font = "20px Helvetica";
    context.fillStyle = "#aaa";
    context.fillText(params.text, 450, params.y - 10);
    context.closePath();
    context.restore();
  };
};

var TextArea = function () {
  var self = this;

  var startX = 0;
  var startY = 590;
  var endX = 630;
  var endY = 730;

  self.render = function (context) {
    context.save();
    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = "#999";
    context.moveTo(startX, startY);
    context.lineTo(endX, startY);
    context.stroke();
    context.lineTo(endX, endY);
    context.stroke();
    context.closePath();

    context.font = "20px Helvetica";
    context.fillStyle = "black";

    for (var i = 0; i < self.text.length; i += 1) {
      var line = self.text[i];
      context.fillText(line, startX + 15, startY + 35 + 28 * i);
    }

    context.restore();
  };
};

var Control = function (params) {
  var self = this;
  self.id = params.id;

  var width = 18;
  var height = 20;

  self.render = function (context) {
    context.save();
    context.beginPath();
    context.moveTo(params.x, params.y);
    context.lineTo(params.x, params.y + height);
    context.lineTo(params.x + width * params.direction, params.y + height / 2);
    context.fillStyle = "gray";
    context.fill();
    context.closePath();
    context.restore();
  };

  self.contains = function (x, y) {
    var minX, maxX;

    if (params.direction > 0) {
      minX = params.x;
      maxX = params.x + width;
    } else {
      minX = params.x - width;
      maxX = params.x;
    }

    if (x >= minX && x <= maxX && y >= params.y && y <= params.y + height) {
      return true;
    }

    return false;
  };
};

var Animation = function (params) {
  var self = this;

  var text = [
    [
      "Welcome! You are looking at Sentient's execution model.",
      "This may seem a little daunting at first but don't worry – you can",
      "use this panel to walk through it, one step at a time using",
      "the arrows on the right."
    ],
    [
      "Our journey begins at the Level 3 Compiler. You can see that",
      "Sentient is made up of a compilation stack and a runtime stack.",
      "Sentient programs must be compiled ahead of time before they",
      "can be run – similar to languages like Java and Go."
    ],
    [
      "This process is broken into stages called 'Abstraction Levels'. At",
      "each level, high-level code is compiled into lower level code that's",
      "simpler in structure and easier to work with. We also capture some",
      "metadata that will be explained in more detail later."
    ],
    [
      "This process repeats itself a number of times. Here you can see",
      "the code produced by the Level 3 Compiler being fed into the",
      "Level 2 Compiler. Each of these compilers is independent and",
      "could, in theory, be written in any language."
    ],
    [
      "As we approach the lowest level, our programs have been reduced",
      "to simple expressions of first-order logic. They no longer have any",
      "of the constructs you'd expect from a programming language, like",
      "integers or conditional statements."
    ],
    [
      "The final compilation stage takes these expressions of first-order",
      "logic and compiles them into conjunctive normal form expressions.",
      "These are known as 'products of sums' and are a standard",
      "used by solvers of the boolean satisfiability problem."
    ],
    [
      "The compilation stack bottoms out by producing Machine Code",
      "that specifically targets a Sentient Machine. This comprises a",
      "boolean formula in conjunctive normal form annotated by metadata",
      "produced by each compilation stage."
    ],
    [
      "We now move over to the runtime stack of Sentient's execution",
      "model. We can optionally specify some Assignments to be set in",
      "our program before it runs. This is akin to setting standard input",
      "for our program."
    ],
    [
      "The Level 3 Runtime takes these assignments and uses the",
      "metadata produced by the compilation stack to translate these",
      "high-level assignments into an equivalent set of assignments",
      "for the Level 2 Runtime.",
    ],
    [
      "This process repeats itself a number of times in a similar manner",
      "to the compilation stack. The grey lines between the compilation",
      "stack and the runtime stack denote that the compilers and",
      "runtimes mirror each other."
    ],
    [
      "At each level, the runtimes read from the Machine Code in order to",
      "translate their assignments into lower level assignments. This",
      "isn't shown here, but it's worth noting that the runtime stack has",
      "implicit visibility over the Machine Code."
    ],
    [
      "Finally, we approach the bottom of the runtime stack and our",
      "assignments have been reduced to simple true / false assignments",
      "for the variables of our program. These assignments are fed into",
      "the lowest level runtime."
    ],
    [
      "The Level 1 Runtime takes these true / false assignments and",
      "appends them as additional clauses to the Machine Code. Each",
      "assignment adds an invariant that must be upheld when our",
      "program runs on the Sentient Machine."
    ],
    [
      "We are now ready to run our program on the Sentient Machine!",
      "A Sentient Machine is really just an abstraction over a SAT Solver.",
      "It allows you to run Sentient programs using different solvers",
      "and on different platforms."
    ],
    [
      "For example, you might want to run your Sentient program with",
      "a SAT Solver called Lingeling which is a highly performant solver",
      "written in C. Or you may wish to use a lightweight and portable",
      "solver that runs in a web browser."
    ],
    [
      "Once the SAT Solver finds a solution (if one exists), its results",
      "are interpreted by the Sentient Machine. This largely consists of",
      "reading a stream of positive and negative numbers and translating",
      "them into true and false values, respectively."
    ],
    [
      "The result of this translation is a Solution, which is a set of",
      "true / false assignments for every term that appears in the",
      "Machine Code. For a non-trivial program, this could consist of",
      "tens or hundreds of thousands of values."
    ],
    [
      "At this stage, we have our Solution, but it consists of a cryptic",
      "set of true / false values that don't really mean anything. It is",
      "now time to begin our ascent of the runtime stack to progressively",
      "interpret the Solution."
    ],
    [
      "The Level 1 Runtime kicks off this process by looking up each",
      "term from the Machine Code's metadata, giving it a variable name.",
      "This is effectively the inverse of the operation performed earlier",
      "by the Level 1 Runtime."
    ],
    [
      "The Level 1 Results are then fed to the Level 2 Runtime. We",
      "need to repeatedly climb the ladder of abstractions by feeding",
      "the results of the previous interpretation into the next level",
      "runtime."
    ],
    [
      "The Level 2 Runtime re-introduces the abstraction of integers.",
      "More specifically, it maps true / false values onto the individual",
      "bits of twos-complement integers."
    ],
    [
      "The Level 3 Runtime re-introduces the abstraction of arrays.",
      "More specifically, it collects booleans and integers into",
      "arrays of arbitrary width. These arrays can also be arbitrarily",
      "nested within one another."
    ],
    [
      "Finally, we reach the pinnacle of our runtime stack and the",
      "results of running our Sentient program are fed back to the",
      "user. Typically, this entire process takes about 20 milliseconds",
      "depending on which SAT Solver is used."
    ]
  ];

  var frame = 0;
  var maxFrames = text.length;

  self.nextFrame = function () {
    frame += 1;

    if (frame >= maxFrames) {
      frame -= maxFrames;
    }
  };

  self.previousFrame = function () {
    frame -= 1;

    if (frame < 0) {
      frame += maxFrames;
    }
  };

  self.getFrame = function () {
    var frameText = text[frame] || [];
    var frameArrow = params.arrows[frame - 1];
    var frameFromTile, frameToTile;

    if (frameArrow) {
      for (var i = 0; i < params.tiles.length; i += 1) {
        var tile = params.tiles[i];

        if (tile.id === frameArrow.from) {
          frameFromTile = tile;
        } else if (tile.id === frameArrow.to) {
          frameToTile = tile;
        }
      }
    }

    return {
      text: frameText,
      selectedTiles: [frameFromTile, frameToTile],
      selectedArrow: frameArrow
    };
  };
};

window.Application = Application;
