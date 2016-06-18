##Getting Started

Welcome to the Sentient programming language! Sentient probably isn't like other
languages you've used before and this guide aims to get you set up with Sentient
and introduce you to the language.

###Installing Sentient

If you're running Node, you can install Sentient with:

```bash
npm install -g sentient-lang
```

And that's it! That will install the `sentient` executable which you can use for
compiling and running Sentient programs.

At present, Sentient is officially supported in Node 4 or newer, but it will
probably work with older versions, too. You can check which version of Node
you're running with `node --version`.

###Running in a browser

Sentient is designed to run anywhere that JavaScript runs. If you'd prefer, you
can run Sentient directly in your web browser by including the following script
tag in a HTML page:

```html
<script src="https://github.com/sentient-lang/sentient-lang/blob/gh-pages/bin/sentient.js"></script>
```

This will add `Sentient` as a global variable, which you can use for compiling
and running Sentient programs.

For now, this guide will assume you're running Sentient on a command-line via
node rather than in a browser, but it's useful to know that Sentient programs
can be run anywhere!

###Sentient executable

On a command-line run `sentient --help`. This will present the various options
provided by the executable. As you can see, Sentient supports the compilation
and running of programs as well as a few other things, which we'll come to
later. If you're curious about any of these, the `--help-verb` option is
especially useful.

```
  Usage: sentient [options] [file]

  Sentient Language Compiler and Runtime, Version 0.0.0-alpha.25

  Options:

    -h, --help                output usage information
    -H, --help-verbose        output usage information with explanation
    -v, --version             output the version number
    -c, --compile             compile a program to machine code
    -o, --optimise            optimise a pre-compiled program
    -r, --run                 run a pre-compiled program
    -a, --assign '<json>'     assign some of the exposed variables
    -A, --assign-file <file>  read assignments from a file
    -n, --number <n>          return the given number of solutions
    -m, --machine <name>      use the specified machine adapter
    -w, --wrap <name>         wrap the program in JavaScript boilerplate
    -i, --info                set the log level to info
    -d, --debug               set the log level to debug
```

For now, we're going to be using Sentient in its vanilla mode without any
options. By default, Sentient will compile and run programs in a single step and
print the results. We're going to be using this in our 'Hello, world!' example
below.

###Hello, world!

Our 'Hello, world!' example won't actually print 'Hello, world!'. Instead, we're
going to be writing a simple program that finds three numbers that add up to
ten. To begin with, create a file called `ten.snt` and add the following lines:

```javascript
int a, b, c;

invariant a + b + c == 10;
invariant a > 0, b > 0, c > 0;

expose a, b, c;
```

Save the file and run `sentient ten.snt`. You should see the following output:

```javascript
{ a: 1, b: 1, c: 8 }
```

And there you have it – your first Sentient program! Notice that we didn't
actually *tell* Sentient how to find numbers that add to ten, we just described
the constraints or *invariants* of the problem to it. That's how Sentient
programs are written – and probably why Sentient isn't like other languages
you've used before. Welcome to a new way of thinking!

###Program breakdown

If you're wondering what each of the lines mean, here's a quick overview. For a
more thorough overview, you may wish to explore the [language specification](????).

**Line 1:** `int a, b, c`

This line declares three integers named 'a', 'b' and 'c'. Integers can be both
positive and negative numbers.

**Line 2:** `invariant a + b + c == 10;`

This line captures the essence of our program. We want to find three numbers
that add to ten and this line states that this is an invariant of the program,
i.e. that this is something that must always be true.

**Line 3:** `invariant a > 0, b > 0, c > 0;`

As mentioned above, integers can also be negative. This line adds another
invariant that rules out negative numbers. We didn't really need to do this, but
it serves as an interesting example.

**Line 4:** `expose a, b, c;`

This line makes it so that 'a', 'b' and 'c' all appear in the program output
when it runs. Variables must be explicitly exposed from Sentient programs.

###Multiple solutions

We can instruct Sentient to find multiple solutions for this program with the
`--number` option. Try running Sentient like so:

```bash
sentient ten.snt --number 3
```

You should see the following output:

```javascript
{ a: 1, b: 1, c: 8 }
{ a: 5, b: 1, c: 4 }
{ a: 3, b: 1, c: 6 }
```

These solutions appear in no particular order. You can also instruct Sentient to
run exhaustively until it's found all solutions:

```bash
sentient ten.snt --number 0
```

When you do this, the last line contains `{}`. This indicates that there are no
more solutions. You'd get the same result if you ran the program with
`--number 999`.

###Assigning variables

Sentient allows you to assign values to variables at runtime. For example, we
could run our program again with 'a' set to 5:

```bash
sentient ten.snt --assign '{ a: 5 }'
```

This means that you can write a generic program that solves some problem and
then assign some of its variables at runtime to suit your needs. For example,
you might write a program for solving Sudoku puzzles, then assign some of its
variables at runtime to the numbers entered by a user.

For our simple program, we could make it more generic! Instead of hardcoding the
total to 10, we could introduce a 'target' and then set it at runtime:

```javascript
int a, b, c, target;

invariant a + b + c == target;
invariant a > 0, b > 0, c > 0;

expose a, b, c, target;
```

```bash
sentient ten.snt --assign '{ target: 15 }'
```

Perhaps we should rename our program to something more appropriate!

###Pre-compiling

So far, we've been compiling and running programs in a single step. This works
well for simple programs or for programs where you only want one solution. In
most cases, it is better to pre-compile programs so that you do as much work
upfront before the program runs:

```bash
sentient ten.snt --compile > ten.json
```

Sentient programs are compiled down to JSON files that can be run like so:

```bash
sentient ten.json --run
```

One advantage of pre-compiling programs is that you can optimise them to run
much faster. Optimisation is out of scope for this guide, but you can read more
about it [here](?????).

###Next steps

Congratulations, if you've got this far you've survived the Getting Started
guide. You now know the basics of how to compile and run programs with Sentient.
It is recommended that you do one of the following next:

- Check out the [language specification](???) for Sentient
- Write a Sentient program to find [Pythagorean Triples](https://en.wikipedia.org/wiki/Pythagorean_triple)
- Play with some [example programs](???)

Good luck!
