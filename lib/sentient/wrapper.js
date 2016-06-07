"use strict";

var Wrapper = function (name, program) {
  var self = this;

  self.wrap = function () {
    program = program.replace(/\n/g, "\\n");

    var wrappedProgram = "(function () {                                     \n\
        'use strict';                                                        \n\
                                                                             \n\
        var name = '" + name + "';                                           \n\
        var program = '" + program + "';                                     \n\
                                                                             \n\
        if (typeof window !== 'undefined') {                                 \n\
          window.Sentient = window.Sentient || {};                           \n\
          window.Sentient.programs = window.Sentient.programs || {};         \n\
          window.Sentient.programs[name] = program;                          \n\
        }                                                                    \n\
                                                                             \n\
        if (typeof module !== 'undefined') {                                 \n\
          module.exports = module.exports || {};                             \n\
          module.exports[name] = program;                                    \n\
        }                                                                    \n\
      })();                                                                  \n\
    ";

    wrappedProgram = wrappedProgram.replace(/      /g, "");
    wrappedProgram = wrappedProgram.replace(/ +$/gm, "");

    return wrappedProgram;
  };
};

Wrapper.wrap = function (name, program) {
  return new Wrapper(name, program).wrap();
};

module.exports = Wrapper;
