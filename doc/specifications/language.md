##Language Specification

This document describes the syntax of the Sentient programming language. It is
recommended that you familiarise yourself with this specification if you are
just getting started. This specification is intended to be informative and
brief. For a more thorough understanding of the language, please refer to the
[examples](TODO), which are heavily annotated.

If you haven't read the [Getting Started](../guides/getting_started.md) guide
yet, it is recommended you do so first.

###Sentient programs

Sentient programs are comprised of 'statements' separated by semi-colons. Each
type of statement is explained below. Programs can be annotated with comments
that follow a '#' character and terminate at the end of the line.

###Assignment

An assignment is used to assign an expression to a variable. Here is an example:

```ruby
a = 2 + 2;
```

You don't need to declare variables first. Their type will be inferred from the
expression being assigned. You can assign multiple expressions to variables at
the same time, for example:

```ruby
a, b, c = 10, true, [123];
```

It is possible to combine assignment with arithmetic and boolean operators, such
as:

```ruby
total += 1;
```

###Expression

An expression can contain any combination of variables, constants, operators and
function calls. Expressions must appear as part of an assignment with the
exception that function calls may appear by themselves. Here are some examples:

```ruby
total = (1 + x) * -3;

a = (b || c) && d;

myArray = [1, 2, 3];

y = cube(5) + square(x);

updateTotal(25);
```

Most of the operators you'd expect are supported as well as a large collection
of built-in functions. Please refer to the [standard library](TODO) for more
information.

###Declaration

A declaration is used to declare a variable for use in a program but without
specifying what its value is. Sentient programs are declarative and so the
values of their variables are not determined until the program runs.

A declaration is comprised of a type definition and the names of one or more
variables. Here is an example:

```ruby
int a, b, c;
```

Valid types are one of 'int', 'bool' and 'array'. By default, integers range
between -128 and 127, but this can be made bigger (or smaller) by specifying the
number of bits after the type. An 'int10', for example, will range between -512
and 511.

```ruby
int10 a, b, c;
```

Declaring an array is a little more complicated. The size of the array must be
specified in the type definition in addition to the type of its elements. Arrays
are homogeneous, which means that its elements are all be the same type. Here
are some examples:

```ruby
array3<bool> myArray;

array4<int> fourInts;

array5<int20> fiveBigInts;
```

Nested arrays are supported. These declarations look a little more complicated.
The example below declares a structure that would be suitable for holding some
coordinates:

```ruby
array10<array2<int>> points;
```

###Exposure

An exposure is used to expose a variable that will be printed after the program
finishes running. Any exposed variable can also be assigned to a specific value
before the program runs. This allows you to run a single program with different
inputs. Here is an example:

```ruby
expose points;
```

You can expose multiple variables at the same time, for example:

```ruby
expose a, b, c, total;
```

###Invariant

An invariant is used to specify something that must always be true when the
program runs. Invariants allow you to define the constraints of your problem
domain. Here is an example:

```ruby
invariant a + b + c == 10;
```

When this program runs, it will only produce outputs such that the total of
variables 'a', 'b' and 'c' is equal to 10. You can define any number of
invariants throughout your program and it is possible to define multiple
invariants on the same line:

```ruby
invariant a > 0, b > 0, c > 0;
```

###Function

A function is used to combine a sequence of statements so that it may be called
multiple times throughout a program. Functions also allow names to be given to
sections of code, improving readability. Here is an example:

```ruby
function fizzbuzz? (number) {
  divisibleBy3 = number % 3 == 0;
  divisibleBy5 = number % 5 == 0;

  return divisibleBy3 && divisibleBy5;
};
```

The following sections explain how functions are defined and called in Sentient.
These sections get progressively more complicated but you should be able to
glean the basics from without having to understand all of its intricacy.

**Defining functions**

Functions can be defined anywhere in a program, including inside other
functions. All function names are global and if a function definition appears
with the same name elsewhere, it will be redefined.

Function names can optionally be suffixed with a single '?' or '!' character.
Functions can take any number of arguments and can return any number of values.
Here is an example:

```ruby
function payForGoods (cost, balance) {
  balance -= cost;
  overdrawn = balance < 0;

  return balance, overdrawn;
};
```

If a function returns values, its return statement must appear as the last
statement in a function.

**Scope**

By default, functions have local scope and cannot access variables from outside.
Functions are pass-by-value, which means that a copy is made of the function's
arguments when they are passed in.

It is possible to define functions that can access variables outside by using
the '^' modifier. The following example updates the 'balance' variable, which
appears outside of the defined function:

```ruby
balance = 1000;

function^ payForGoods (cost) {
  balance -= cost;
  overdrawn = balance < 0;

  return overdrawn;
};
```

If functions are nested, the '^' modified will not provide access to variables
outside of the outermost function unless that also uses the '^' modifier.

**Calling functions**

Functions are called by passing arguments within parentheses. You can either
call functions as part of an assignment or in a statement on their own. This is
to support cases where functions have side-effects such as this example:

```ruby
payForGoods(50);
```

When functions return more than one value, you can use multiple assignment to
set those values to variables:

```ruby
div, mod = divmod(10, 3);
```

**Method syntax**

It is also possible to call functions using a 'method' syntax. Any function can
be called on any value and that value will be passed as the first argument to
the function. Here is an example:

```ruby
div, mod = 10.divmod(3);
```

When functions are called as methods, the parentheses are optional unless there
are additional arguments, for example:

```ruby
a = 75.fizzbuzz?;
```

In fact, almost all syntax in the language is described as method calls on
values which means that these are all equivalent:

```ruby
a = 2 + 2;
a = +(2, 2);
a = 2.+(2);
```

**Function pointers**

It is possible to pass functions as arguments to other functions using function
pointers. You can pass any number of pointers to a function. A function pointer
is denoted by prefixing a '*' to an argument:

```ruby
function callTwice (x, *f) {
  return f(f(x));
};

function double (x) {
  return x * 2;
};

a = 5.callTwice(*double);
```

Sentient also supports anonymous functions, which can be passed in to other
functions. Here is an example that adds the numbers in an array:

```ruby
array5<int> numbers;
total = 0;

numbers.each(function^ (number) {
  total += number;
});

expose numbers, total;
```

###Next steps

Hopefully this has given you a better understanding of the syntax of Sentient.
It is recommended that you do one of the following next:

- Check out the [standard library](TODO)
- Write a Sentient program to find [Magic Squares](https://en.wikipedia.org/wiki/Magic_square)
- Play with some [example programs](TODO)

Good luck!
