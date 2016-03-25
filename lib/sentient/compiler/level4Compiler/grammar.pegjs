{
  var leftAssociative = function (head, tail) {
    return tail.reduce(function (acc, element) {
      return [acc, element.expr, element.operator];
    }, head);
  };
}

declaration
  = type:type whitespace variableList:variableList {
    return [type, variableList];
  }

assignment
  = variableList:variableList whitespace "=" whitespace exprList:expressionList {
    return [variableList, exprList];
  }

vary
  = "vary" whitespace variableList:variableList {
    return variableList;
  }

invariant
  = "invariant" whitespace expressionList:expressionList {
    return expressionList;
  }

variableList
  = head:variable tail:variableListTail? {
    if (tail) {
      return [head].concat(tail);
    } else {
      return [head];
    }
  }

variableListTail
  = whitespace? "," whitespace? tail:variableList {
    return tail;
  }

variable
  = !constant name:$([a-z][a-z0-9_]*) {
    return name;
  }

constant
  = "true" ![a-z0-9_] {
    return true;
  } / "false" ![a-z0-9_] {
    return false;
  } / [0-9]+ {
    return parseInt(text(), 10);
  }

type
  = typeBool / typeInt / typeArray

typeBool
  = "bool" {
    return ["bool"];
  }

typeInt
  = "int" width:positiveInteger? {
    if (width) {
      return ["int", width];
    } else {
      return ["int"];
    }
  }

positiveInteger
  = [1-9][0-9]* {
    return parseInt(text(), 10);
  }

typeArray
  = "array" width:positiveInteger "<" subtype:type ">" {
    return ["array", width].concat(subtype);
  }

expressionList
  = head:expression tail:expressionListTail? {
    if (tail) {
      return [head].concat(tail);
    } else {
      return [head];
    }
  }

expressionListTail
  = whitespace? "," whitespace? tail:expressionList {
    return tail;
  }


expression
  = exprDisjunctive

exprDisjunctive
  = head:exprConjunctive tail:exprDisjunctiveTail* {
    return leftAssociative(head, tail);
  }

exprDisjunctiveTail
  = whitespace operator:"||" whitespace expr:exprConjunctive {
    return { expr: expr, operator: operator };
  }

exprConjunctive
  = head:exprEquality tail:exprConjunctiveTail* {
    return leftAssociative(head, tail);
  }

exprConjunctiveTail
  = whitespace operator:"&&" whitespace expr:exprEquality {
    return { expr: expr, operator: operator };
  }

exprEquality
  = head:exprComparative tail:exprEqualityTail* {
    return leftAssociative(head, tail);
  }

exprEqualityTail
  = whitespace operator:("==" / "!=") whitespace expr:exprComparative {
    return { expr: expr, operator: operator };
  }

exprComparative
  = left:exprAdditive whitespace operator:("<=" / ">=" / "<" / ">") whitespace right:exprAdditive {
    return [left, right, operator];
  }
  / exprAdditive

exprAdditive
  = head:exprMultiplicative tail:exprAdditiveTail* {
    return leftAssociative(head, tail);
  }

exprAdditiveTail
  = whitespace operator:("+" / "-") whitespace expr:exprMultiplicative {
    return { expr: expr, operator: operator };
  }

exprMultiplicative
  = head:exprUnary tail:exprMultiplicativeTail* {
    return leftAssociative(head, tail);
  }

exprMultiplicativeTail
  = whitespace operator:("*" / "/" / "%") whitespace expr:exprUnary {
    return { expr: expr, operator: operator };
  }

exprUnary
  = operator:("!" / "-") expr:exprPrimary {
    return [expr, operator];
  }
  / exprPrimary

exprPrimary
  = constant / variable / "(" whitespace? expr:expression whitespace? ")" {
    return expr;
  }

whitespace
  = ([ \t\r\n] / comment)+ {
    return " ";
  }

comment
  = "#" [^\r\n]* {
    return "";
  }
