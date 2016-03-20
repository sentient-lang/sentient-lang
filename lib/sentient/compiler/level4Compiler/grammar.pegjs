foo
  = .*

declaration
  = type:type whitespace variableList:variableList {
    return [type, variableList];
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
  = $([a-z][a-z0-9_]*)

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

whitespace
  = ([ \t\r\n] / comment)+ {
    return " ";
  }

comment
  = "#" [^\r\n]* {
    return "";
  }
