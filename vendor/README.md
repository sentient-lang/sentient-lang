## How to build minisat.js

The following instructions detail how to build Minisat with Emscripten and
integrate it with Sentient. These steps should be more-or-less repeatable if a
new version of Minisat is released. They may also provide some guidance for
other SAT solvers that are based on Minisat.

## Instructions

- Set up Emscripten portable https://kripken.github.io/emscripten-site/docs/getting_started/index.html
- Clone https://github.com/jgalenson/research.js
- Run ./build.sh, which will initially error
- Edit `build/minisat/minisat/core/SolverTypes.h`
  - Change `friend mkLit` to `mkLit`
  - Change `bool sign` to `bool sign = false`
- Edit build.sh
  - Change `-O2` to `-O3`
  - Remove `TOTAL_MEMORY` and `TOTAL_STACK` options
  - Add `--memory-init-file 0`
  - Add `-s ALLOW_MEMORY_GROWTH=1`
- Run `./build.sh` and copy into `vendor/minisat.js`
- Add Boilerplate A around the line in the file
- Add Boilerplate B immediately after `DYNAMICTOP+15&-16;`
- Add Boilerplace C immediately after `if(DYNAMICTOP>=TOTAL_MEMORY){`
- Add Boilerplace D immediately after `i+15&-16;` (in the `eb` function)
- Set `DEBUG: true` in `minisatAdapter.js`
- Run `make`
- Run `./lib/sentient/cli.js something.snt -n 0`
- Verify that both heap and stack resizing work correctly

**Boilerplate A**

```
module.exports = function (options) {
if (options.DEBUG) { console.log("INITIALIZING: " + JSON.stringify(options)); }
Module = options;
// Existing minified line goes here.
return Module;
};
```

**Boilerplate B**

```
if(Module.DEBUG){console.log("HEAP: "+DYNAMICTOP+" / "+TOTAL_MEMORY+" ("+(DYNAMICTOP/TOTAL_MEMORY*100).toPrecision(3)+"%)")};
```

**Boilerplate C**

```
throw new Error("No heap space left: "+DYNAMICTOP+" >= "+TOTAL_MEMORY);
```

**Boilerplate D**

```
STACKTOP=i;if(Module.DEBUG){console.log("STACK: "+STACKTOP+" / "+STACK_MAX+" ("+(STACKTOP/STACK_MAX*100).toPrecision(3)+"%)")};if(STACKTOP>=STACK_MAX){throw new Error("No stack space left: "+STACKTOP+" >= "+STACK_MAX);}
```
