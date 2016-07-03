##Integer

Integers are one of three types in the Sentient programming language. This
document contains a reference of all integer methods.

###+

Performs addition.

```ruby
5 + 3    #=> 8
```

###-

Performs subtraction.

```ruby
5 - 3    #=> 2
```

###*

Performs multiplication.

```ruby
5 * 3    #=> 15
```

###/

Performs integer Euclidean division, returning the quotient.

```ruby
9 / 2    #=> 4
```

The divisor must not be zero, else the program will have no solutions.

###%

Performs integer Euclidean division, returning the remainder.

```ruby
9 % 2    #=> 1
```

The divisor must not be zero, else the program will have no solutions.

###divmod

Performs integer Euclidean division, returning both quotient and remainder.

```ruby
a, b = 9.divmod(2)    # a: 4, b: 1
```

The divisor must not be zero, else the program will have no solutions.

###-@

Performs unary negation.

```ruby
-(2 + 2)    #=> -4
```

###==

Returns true if the integer on the left is equal to the right.

```ruby
2 == 2    #=> true
2 == 3    #=> false
```

###!=

Returns true if the integer on the left is not equal to the right.

```ruby
2 != 2    #=> false
2 != 3    #=> true
```

###<

Returns true if the integer on the left is less than the right.

```ruby
2 < 1    #=> false
2 < 2    #=> false
2 < 3    #=> true
```

###<=

Returns true if the integer on the left is less than or equal to the right.

```ruby
2 <= 1    #=> false
2 <= 2    #=> true
2 <= 3    #=> true
```

###>

Returns true if the integer on the left is greater than the right.

```ruby
2 > 1    #=> true
2 > 2    #=> false
2 > 3    #=> false
```

###>=

Returns true if the integer on the left is greater than or equal to the right.

```ruby
2 >= 1    #=> true
2 >= 2    #=> true
2 >= 3    #=> false
```

###abs

Returns the absolute value of the integer.

```ruby
5.abs    #=> 5
-5.abs   #=> 5
```

###cube

Returns the cube of the integer.

```ruby
3.cube    #=> 27
```

###downto

Iterates from a start integer downto an end integer.

```ruby
total = 0;

5.downto(3, function^ (i) {
  total += i;
});

# total: 12
```

This method only supports [integer literals](../specification/literals.md).

###even?

Returns true if the integer is even.

```ruby
0.even?    #=> true
1.even?    #=> false
2.even?    #=> true
```

###negative?

Returns true if the integer is less than zero.

```ruby
-1.negative?    #=> true
0.negative?     #=> false
```

###next

Alias for 'succ'.

###odd?

Returns true if the integer is odd.

```ruby
0.odd?    #=> false
1.odd?    #=> true
2.odd?    #=> false
```

###positive?

Returns true if the integer is greater than zero.

```ruby
1.positive?     #=> true
0.positive?     #=> false
```

###pred

Returns the integer's predecessor.

```ruby
3.pred    #=> 2
```

###prev

Alias for 'pred'.

###square

Returns the square of the integer.

```ruby
3.square    #=> 9
```

###succ

Returns the integer's successor.

```ruby
3.succ    #=> 4
```

###times

Iterates up to one less than the integer, starting from 0.

```ruby
total = 0;

5.times(function^ (i) {
  total += i;
});

# total: 10
```

This method only supports [integer literals](../specification/literals.md).

###upto

Iterates from a start integer upto an end integer.

```ruby
total = 0;

3.upto(5, function^ (i) {
  total += i;
});

# total: 12
```

This method only supports [integer literals](../specification/literals.md).

###zero?

Returns true if the integer is equal to zero.

```ruby
0.zero?    #=> true
1.zero?    #=> false
```
