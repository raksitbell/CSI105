// Precedence map for operators
const p = { "^": 3, "*": 2, "/": 2, "+": 1, "-": 1 };

// Tokenizer and operand checker helper functions
const tok = (e) => e.match(/[a-zA-Z0-9]+|[\+\-\*\/\^\(\)]/g) || [];
const isOp = (t) => /^[a-zA-Z0-9]+$/.test(t);

// Unified Shunting Yard algorithm for both Prefix and Postfix
const convert = (exp, pre) => {
  let t = tok(exp);
  // If Prefix: reverse tokens and swap parenthesis directions
  if (pre) t = t.reverse().map((c) => (c === "(" ? ")" : c === ")" ? "(" : c));

  let out = [],
    ops = [];
  t.forEach((c) => {
    if (isOp(c))
      out.push(c); // Append operand to output
    else if (c === "(")
      ops.push(c); // Push open parenthesis
    else if (c === ")") {
      // Pop until open parenthesis is found
      while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop());
      ops.pop(); // Discard '('
    } else {
      // Pop operators based on Precedence & Associativity
      while (ops.length && ops[ops.length - 1] !== "(") {
        let top = ops[ops.length - 1];
        // Prefix handles right-associativity ('^') differently than Postfix
        let cond = pre
          ? p[top] > p[c] || (p[top] === p[c] && c === "^")
          : p[top] > p[c] || (p[top] === p[c] && c !== "^");
        if (cond) out.push(ops.pop());
        else break;
      }
      ops.push(c); // Push current operator
    }
  });

  // Flush remaining operators from stack
  while (ops.length) out.push(ops.pop());
  // If Prefix: restore original order by reversing again
  return (pre ? out.reverse() : out).join(" ");
};

// Main DOM element handler
const handleConversion = (e) => {
  e.preventDefault();
  let v = document.getElementById("expressionInput").value.trim();
  if (!v) return;

  // Inject results into output div
  document.getElementById("output").innerHTML = `
        <div style="margin-top:2rem;padding:1.5rem;background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px">
            <h3 style="margin: 0 0 1rem; color: #343a40;">Results:</h3>
            <p style="font-family: monospace; font-size: 1.1rem; margin-bottom: 0.5rem">
                <b style="font-family: sans-serif; color: #495057;">Prefix:</b> 
                <span style="color: #0d6efd;">${convert(v, true)}</span>
            </p>
            <p style="font-family: monospace; font-size: 1.1rem; margin: 0">
                <b style="font-family: sans-serif; color: #495057;">Postfix:</b> 
                <span style="color: #198754;">${convert(v, false)}</span>
            </p>
        </div>`;
};
