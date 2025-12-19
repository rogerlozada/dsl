const ohm = require('ohm-js');

// Define a simple grammar for arithmetic expressions
const grammar = ohm.grammar(`
  Arithmetic {
    Exp
      = AddExp

    AddExp
      = AddExp "+" MulExp  -- plus
      | AddExp "-" MulExp  -- minus
      | MulExp

    MulExp
      = MulExp "*" ExpExp  -- times
      | MulExp "/" ExpExp  -- divide
      | ExpExp

    ExpExp
      = PriExp "^" ExpExp  -- power
      | PriExp

    PriExp
      = "(" Exp ")"  -- paren
      | number

    number  (a number)
      = digit* "." digit+  -- fract
      | digit+             -- whole
  }
`);

// Create a semantics object
const semantics = grammar.createSemantics().addOperation('eval', {
  Exp(e) {
    return e.eval();
  },
  AddExp_plus(a, _, b) {
    return a.eval() + b.eval();
  },
  AddExp_minus(a, _, b) {
    return a.eval() - b.eval();
  },
  MulExp_times(a, _, b) {
    return a.eval() * b.eval();
  },
  MulExp_divide(a, _, b) {
    return a.eval() / b.eval();
  },
  ExpExp_power(a, _, b) {
    return Math.pow(a.eval(), b.eval());
  },
  PriExp_paren(_, e, __) {
    return e.eval();
  },
  number_fract(a, _, b) {
    return parseFloat(a.sourceString + '.' + b.sourceString);
  },
  number_whole(a) {
    return parseInt(a.sourceString);
  }
});

// Test function
function calculate(expression) {
  const matchResult = grammar.match(expression);
  if (matchResult.succeeded()) {
    return semantics(matchResult).eval();
  } else {
    throw new Error('Invalid expression: ' + expression);
  }
}

// Run some tests
console.log('Testing ohm-js with arithmetic expressions:');
console.log('2 + 3 * 4 =', calculate('2 + 3 * 4'));
console.log('(2 + 3) * 4 =', calculate('(2 + 3) * 4'));
console.log('10 / 2 - 3 =', calculate('10 / 2 - 3'));
console.log('2 ^ 3 + 1 =', calculate('2 ^ 3 + 1'));
console.log('3.14 * 2 =', calculate('3.14 * 2'));

// Test error handling
try {
  calculate('2 +');
} catch (e) {
  console.log('Error caught:', e.message);
}
