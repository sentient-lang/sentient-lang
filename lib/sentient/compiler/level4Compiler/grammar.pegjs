{
  var leftAssociative = function (head, tail) {
    return tail.reduce(function (acc, element) {
      return [element.operator, acc].concat(element.expr);
    }, head);
  };
}

program
  = (whitespace / ";")* lines:programLine* {
    return lines;
  }

programLine
  = statement:statement whitespace? ";" (whitespace / ";")* {
    return statement;
  }

statement
  = s:declaration {
    return { type: "declaration", value: s };
  }
  / s:(assignment / compositeAssignment) {
    return { type: "assignment", value: s };
  }
  / s:expose {
    return { type: "expose", value: s };
  }
  / s:invariant {
    return { type: "invariant", value: s };
  }
  / s:function {
    return { type: "function", value: s };
  }
  / s:exprFunction {
    return { type: "functionExpression", value: s };
  }
  / s:exprMethodMandatory {
    return { type: "functionExpression", value: s };
  }

declaration
  = type:type whitespace variableList:variableList {
    return [type, variableList];
  }

assignment
  = variableList:variableList whitespace? "=" whitespace? exprList:expressionList {
    return [variableList, exprList];
  }

compositeAssignment
  = variable:variable whitespace? operator:("+" / "-" / "*" / "/" / "%" / "&&" / "||") "=" whitespace? expr:expression {
    return [[variable], [[operator, variable, expr]]];
  }

expose
  = "expose" whitespace variableList:variableList {
    return variableList;
  }

invariant
  = "invariant" whitespace expressionList:expressionList {
    return expressionList;
  }

function
  = signature:functionSignature whitespace? body:functionBody {
    return {
      name: signature[0],
      dynamic: signature[1],
      immutable: signature[2],
      args: signature[3],
      body: body[0],
      ret: body[1]
    };
  }

functionSignature
  = "function" dynamic:"^"? whitespace name:methodName? immutable:"&"? whitespace? "(" whitespace? args:argumentList? whitespace? ")" {
    dynamic = dynamic === "^";
    immutable = immutable === "&";
    name = name || "_anonymous";
    return [name, dynamic, immutable, args || []];
  }

argumentList
  = head:argument tail:argumentListTail? {
    if (tail) {
      return [head].concat(tail);
    } else {
      return [head];
    }
  }

argumentListTail
  = whitespace? "," whitespace? tail:argumentList {
    return tail;
  }

argument
  = variable / $("*" methodName)

functionBody
  = "{" body:program returnStatement:returnStatement? "}" {
    return [body, returnStatement || [0]];
  }

returnStatement
  = "return" returnList:returnList? whitespace? ";" (whitespace / ";")* {
    return returnList || [0];
  }

returnList
  = width:positiveInteger? whitespace expressionList:expressionList {
    var exprWidth = expressionList.length;

    if (width && exprWidth > width) {
      var message = "'return" + width + "' was specified, but the function"
      message += " returns (at least) " + exprWidth + " expressions"
      throw new Error(message);
    }

    width = width || exprWidth;
    expressionList.unshift(width);
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
  = !reservedWord name:$([a-zA-Z][a-zA-Z0-9_]*) {
    return name;
  }

reservedWord
  = constant
  / "expose"
  / "invariant"
  / "function"
  / "return"
  / "bool"
  / "int"
  / "array"

methodName
  = $(variable ("?" / "!")?) / operator

operator
  =  "[]" / "-@" / "!@" / "<=" / ">=" / "==" / "!=" / "&&" / "||" / [+\-*/%<>]

constant
  = "true" ![a-zA-Z0-9_] {
    return true;
  } / "false" ![a-zA-Z0-9_] {
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
  = exprTernary

exprTernary
  = c:exprDisjunctive whitespace? "?" whitespace? ifTrue:exprTernary whitespace? ":" whitespace? ifFalse:exprTernary {
    return ["if", c, ifTrue, ifFalse];
  }
  / exprDisjunctive

exprDisjunctive
  = head:exprConjunctive tail:exprDisjunctiveTail* {
    return leftAssociative(head, tail);
  }

exprDisjunctiveTail
  = whitespace? operator:"||" whitespace? expr:exprConjunctive {
    return { expr: [expr], operator: operator };
  }

exprConjunctive
  = head:exprEquality tail:exprConjunctiveTail* {
    return leftAssociative(head, tail);
  }

exprConjunctiveTail
  = whitespace? operator:"&&" whitespace? expr:exprEquality {
    return { expr: [expr], operator: operator };
  }

exprEquality
  = head:exprComparative tail:exprEqualityTail* {
    return leftAssociative(head, tail);
  }

exprEqualityTail
  = whitespace? operator:("==" / "!=") whitespace? expr:exprComparative {
    return { expr: [expr], operator: operator };
  }

exprComparative
  = left:exprAdditive whitespace? operator:("<=" / ">=" / "<" / ">") whitespace? right:exprAdditive {
    return [operator, left, right];
  }
  / exprAdditive

exprAdditive
  = head:exprMultiplicative tail:exprAdditiveTail* {
    return leftAssociative(head, tail);
  }

exprAdditiveTail
  = whitespace? operator:("+" / "-") whitespace? expr:exprMultiplicative {
    return { expr: [expr], operator: operator };
  }

exprMultiplicative
  = head:exprNot tail:exprMultiplicativeTail* {
    return leftAssociative(head, tail);
  }

exprMultiplicativeTail
  = whitespace? operator:("*" / "/" / "%") whitespace? expr:exprNot {
    return { expr: [expr], operator: operator };
  }

exprNot
  = "!" expr:exprMethod {
    return ["!@", expr];
  }
  / exprMethod

exprMethod
  = exprMethodMandatory / exprNegate

exprMethodMandatory
  = head:exprNegate tail:exprMethodTail+ {
    return leftAssociative(head, tail);
  }

exprMethodTail
  = "." methodName:methodName methodArgs:exprMethodArgs? {
    methodArgs = methodArgs || [];
    return { expr: methodArgs, operator: methodName };
  }

exprMethodArgs
  = "(" whitespace? callList:callList? whitespace? ")" {
    return callList;
  }

exprNegate
  = "-" expr:exprFetch {
    return ["-@", expr];
  }
  / exprFetch

exprFetch
  = head:exprPrimary tail:exprFetchTail* {
    return leftAssociative(head, tail);
  }

exprFetchTail
  = "[" whitespace? arg:expression whitespace? "]" {
    return { expr: [arg], operator: "[]" };
  }

exprPrimary
  = exprFunction
  / exprBuildArray
  / constant
  / variable
  / "(" whitespace? expr:expression whitespace? ")" {
    return expr;
  }

exprBuildArray
  = "[" whitespace? exprList:expressionList? whitespace? "]" {
    exprList = exprList || [];
    exprList.unshift("buildArray");

    return exprList;
  }

exprFunction
  = methodName:methodName "(" whitespace? callList:callList? whitespace? ")" {
    callList = callList || [];
    callList.unshift(methodName);
    return callList;
  }

callList
  = head:call tail:callListTail? {
    if (tail) {
      return [head].concat(tail);
    } else {
      return [head];
    }
  }

callListTail
  = whitespace? "," whitespace? tail:callList {
    return tail;
  }

call
  = function / expression / $("*" methodName)

whitespace
  = ([ \t\r\n] / comment)+ {
    return " ";
  }

comment
  = "#" [^\r\n]* {
    return "";
  }
