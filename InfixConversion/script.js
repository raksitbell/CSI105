// Helper to determine if character is an operand
const isOperand = (char) => /^[a-zA-Z0-9]+$/.test(char);

// Function to get precedence as defined in flowchart
const getPrecedence = (operator) => {
  if (operator === "^") return 3;
  if (operator === "*" || operator === "/") return 2;
  if (operator === "+" || operator === "-") return 1;
  return 0; // else
};

// Start_InfixtoPostfix
const InfixtoPostfix = (expression) => {
  let Stack = [];
  let PostFix = [];
  let index = 0;

  while (index < expression.length) {
    let char = expression.charAt(index);

    if (isOperand(char)) {
      // Operrand is?
      PostFix.push(char); // Postfix push(char)
    } else if (char === "(") {
      // char = (
      Stack.push(char); // Stack.push(char)
    } else if (char === ")") {
      // char = )
      // Pop from stack and push to Postfix until '(' is found
      while (Stack.length > 0 && Stack[Stack.length - 1] !== "(") {
        PostFix.push(Stack.pop());
      }
      if (Stack.length > 0 && Stack[Stack.length - 1] === "(") {
        Stack.pop(); // Remove '(' from stack
      }
    } else {
      // Operator ?
      // check priority && insert char to Postfix
      while (
        Stack.length > 0 &&
        Stack[Stack.length - 1] !== "(" &&
        (getPrecedence(Stack[Stack.length - 1]) > getPrecedence(char) ||
          (getPrecedence(Stack[Stack.length - 1]) === getPrecedence(char) &&
            char !== "^"))
      ) {
        PostFix.push(Stack.pop());
      }
      // Stack.push()
      Stack.push(char);
    }

    index++;
  }

  // Final pop of any remaining operators in stack
  while (Stack.length > 0) {
    PostFix.push(Stack.pop());
  }

  return PostFix.join(""); // return postfix
};

// Start_InfixtoPrefix (Matching flowchart structure)
const InfixtoPrefix = (expression) => {
  // Reverse string and swap parenthesis for Prefix logic
  let reversedExp = expression
    .split("")
    .reverse()
    .map((c) => (c === "(" ? ")" : c === ")" ? "(" : c))
    .join("");

  let Stack = [];
  let PreFix = [];
  let index = 0;

  while (index < reversedExp.length) {
    let char = reversedExp.charAt(index);

    if (isOperand(char)) {
      PreFix.push(char);
    } else if (char === "(") {
      Stack.push(char);
    } else if (char === ")") {
      while (Stack.length > 0 && Stack[Stack.length - 1] !== "(") {
        PreFix.push(Stack.pop());
      }
      if (Stack.length > 0 && Stack[Stack.length - 1] === "(") {
        Stack.pop();
      }
    } else {
      while (
        Stack.length > 0 &&
        Stack[Stack.length - 1] !== "(" &&
        (getPrecedence(Stack[Stack.length - 1]) > getPrecedence(char) ||
          (getPrecedence(Stack[Stack.length - 1]) === getPrecedence(char) &&
            char === "^"))
      ) {
        PreFix.push(Stack.pop());
      }
      Stack.push(char);
    }

    index++;
  }

  while (Stack.length > 0) {
    PreFix.push(Stack.pop());
  }

  return PreFix.reverse().join(""); // return prefix
};

// Main DOM element handler
const handleConversion = (e) => {
  e.preventDefault();
  let v = document.getElementById("expressionInput").value.trim();
  if (!v) return;

  // Remove Whitespace in Expression
  v = v.replace(/\s+/g, "");

  // Inject results into output div
  document.getElementById("output").innerHTML = `
        <div style="margin-top:2rem;padding:1.5rem;background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px">
            <h3 style="margin: 0 0 1rem; color: #343a40;">Results:</h3>
            <p style="font-family: monospace; font-size: 1.1rem; margin-bottom: 0.5rem">
                <b style="font-family: sans-serif; color: #495057;">Prefix:</b> 
                <span style="color: #0d6efd;">${InfixtoPrefix(v)}</span>
            </p>
            <p style="font-family: monospace; font-size: 1.1rem; margin: 0">
                <b style="font-family: sans-serif; color: #495057;">Postfix:</b> 
                <span style="color: #198754;">${InfixtoPostfix(v)}</span>
            </p>
        </div>`;
};
