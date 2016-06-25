##Literals

Some functions only support literals. For example:

```ruby
# Supported:

3.upto(5, function (i) {
  # ...
});

# Not supported:

a, b = 3, 5;

a.upto(b, function (i) {
  # ...
});
```

In the first case, the literal values '3' and '5' are passed as arguments of the
function. This is supported because it is possible to determine at compile time
how many iterations to perform.

In the second case, the variables 'a' and 'b' are passed as arguments of the
function. Although it is possible, in this specific case to determine how many
iterations should be performed; it is not possible in general.

###Why?

To understand why, consider this example:

```ruby
# Not supported:

int a, b;

a.upto(b, function (i) {
  # ...
});
```

In this case, the values of 'a' and 'b' cannot be determined until the program
runs. Sentient generates code based on how many iterations there are and so,
unfortunately it needs to know this number upfront. This is one of Sentient's
limitations.

Whenever possible, Sentient tries to provide general functions that support
both literals and pre-assigned variables. It will be noted in the language
reference when this limitation applies.
