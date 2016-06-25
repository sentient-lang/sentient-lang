##Array

Arrays are one of three types in the Sentient programming language. This
document contains a reference of all array methods.

###==

Returns true if the array on the left is equal to the right.

```ruby
[1, 2, 3] == [1, 2, 3]    #=> true
[1, 2, 3] == [1, 2, 4]    #=> false
```

###!=

Returns true if the array on the left is not equal to the right.

```ruby
[1, 2, 3] != [1, 2, 3]    #=> false
[1, 2, 3] != [1, 2, 4]    #=> true
```

###[]

Fetches the element at an index from the array.

```ruby
[5, 10, 15].fetch(1)    #=> 10
```

The index must not fall outside the bounds of the array, else the program will
have no solutions.

###bounds?

Returns true if the index is within the bounds of the array.

```ruby
[1, 2, 3].bounds?(-1)    #=> false
[1, 2, 3].bounds?(0)     #=> true
[1, 2, 3].bounds?(3)     #=> false
```

###each

Iterates through each element in the array.

```ruby
total = 0;

[1, 2, 3].each(function^ (element) {
  total += element;
});

# total: 6
```

You may optionally provide an 'index' argument for the function:

```ruby
[1, 2, 3].each(function^ (element, index) {
  # index is 0, then 1, then 2
});
```

You may optionally provide an 'isPresent' argument for the function. This is to
cater for cases where the length of the array is undetermined until the program
runs.

```ruby
nestedArray = [
  [10],
  [20, 30]
];

int index;

nestedArray[index].each(function^ (element, index, isPresent) {
  # ...
});
```

In the example above, the value of 'index' is undetermined until the program
runs. If a value of 0 is chosen, 'element' will be 0 and 'isPresent' will be
false when the second element is reached during iteration.

###eachPair

Iterates through every combination of two-elements in the array:

```ruby
[1, 2, 3].eachPair(function (left, right) {
  # Combinations:
  #
  # left: 1, right: 2
  # left: 1, right: 3
  # left: 2, right: 3
});

You may optionally provide 'index' and 'isPresent' arguments:

```ruby
[1, 2, 3].eachPair(function (l, r, lIndex, rIndex, lPresent, rPresent) {
  # ...
});
```

See `each` for more information on what these arguments mean.

###first

Returns the first element in the array.

```ruby
[1, 2, 3].first    #=> 1
```

###get

Gets the element at an index and performs bounds checking.

If the index lies outside the bounds of the array, 0 or false will be returned
depending on the type of elements in the array. The second argument returned is
a boolean that is true if the index is in bounds.

```ruby
a, b = [5, 10, 15].get(1)     # a: 10, b: true
a, b = [5, 10, 15].get(-1)    # a: 0,  b: false
a, b = [5, 10, 15].get(99)    # a: 0,  b: false
```

###last

Returns the last element in the array.

```ruby
[1, 2, 3].last    #=> 3
```

###length

Returns the length of the array.

```ruby
[1, 2, 3].length    #=> 3
```

###transpose

Transposes a nested array, swapping columns for rows:

```ruby
nestedArray = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

t = nestedArray.transpose

# t: [
#   [1, 4, 7],
#   [2, 5, 8],
#   [3, 6, 9]
# ]
```

Transpose works for nested arrays of different lengths:

```ruby
nestedArray = [
  [1, 2],
  [3, 4, 5],
  [6, 7]
];

t = nestedArray.transpose

# t: [
#   [1, 3, 6],
#   [2, 4, 7],
#   [5]
# ]
```

If this array is iterated, any gaps will set 'isPresent' to false. See `each`
for more information.
