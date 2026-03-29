/**
 * Expression Tree Visualization
 *
 * This script handles the conversion of infix expressions to postfix,
 * and subsequently builds an expression tree while recording each step
 * for visualization.
 */

let steps = [];
let currentStepIndex = -1;
let isPlaying = false;
let animationTimeout = null;
let zoomLevel = 1.0;

/**
 * Utility: delay for animations
 * @param {number} ms
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Node structure for Expression Tree
 */
class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.id = Math.random().toString(36).substr(2, 9);
    }
}

/**
 * Checks if a character is an operator.
 * @param {string} char
 * @returns {boolean}
 */
function isOperator(char) {
    return ['+', '-', '*', '/', '^'].includes(char);
}

/**
 * Gets the precedence of an operator.
 * @param {string} op
 * @returns {number}
 */
function getPrecedence(op) {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    if (op === '^') return 3;
    return 0;
}

/**
 * Converts Infix expression to Postfix (Reverse Polish Notation)
 * @param {string} expression
 * @returns {string[]} tokens in postfix order
 */
function infixToPostfix(expression) {
    const output = [];
    const stack = [];
    // Tokenize: split by operators and parentheses, then filter empty/whitespace
    const tokens = expression.replace(/\s+/g, '').match(/[a-zA-Z0-9]+|[-+*/^()]/g) || [];

    tokens.forEach(token => {
        if (/[a-zA-Z0-9]+/.test(token)) {
            output.push(token);
        } else if (token === '(') {
            stack.push(token);
        } else if (token === ')') {
            while (stack.length && stack[stack.length - 1] !== '(') {
                output.push(stack.pop());
            }
            stack.pop(); // remove '('
        } else {
            while (stack.length && getPrecedence(stack[stack.length - 1]) >= getPrecedence(token)) {
                output.push(stack.pop());
            }
            stack.push(token);
        }
    });

    while (stack.length) {
        output.push(stack.pop());
    }

    return output;
}

/**
 * Converts Infix expression to Prefix
 * @param {string} expression
 * @returns {string[]} tokens in prefix order
 */
function infixToPrefix(expression) {
    // 1. Reverse the expression
    // 2. Change '(' to ')' and vice versa
    // 3. Get Postfix
    // 4. Reverse Postfix

    let reversedInput = "";
    const tokens = expression.replace(/\s+/g, '').match(/[a-zA-Z0-9]+|[-+*/^()]/g) || [];

    // Reverse tokens and flip parentheses
    const reversedTokens = tokens.reverse().map(t => {
        if (t === '(') return ')';
        if (t === ')') return '(';
        return t;
    });

    const stack = [];
    const output = [];

    reversedTokens.forEach(token => {
        if (/[a-zA-Z0-9]+/.test(token)) {
            output.push(token);
        } else if (token === '(') {
            stack.push(token);
        } else if (token === ')') {
            while (stack.length && stack[stack.length - 1] !== '(') {
                output.push(stack.pop());
            }
            stack.pop();
        } else {
            // For prefix, we use a slightly different precedence rule or handle it by reversing
            while (stack.length && getPrecedence(stack[stack.length - 1]) > getPrecedence(token)) {
                output.push(stack.pop());
            }
            stack.push(token);
        }
    });

    while (stack.length) {
        output.push(stack.pop());
    }

    return output.reverse();
}

/**
 * Builds a final tree from postfix tokens (for conversion)
 */
function buildTreeFromPostfix(tokens) {
    const stack = [];
    tokens.forEach(token => {
        const node = new TreeNode(token);
        if (isOperator(token)) {
            node.right = stack.pop();
            node.left = stack.pop();
        }
        stack.push(node);
    });
    return stack[0];
}

/**
 * Builds a final tree from prefix tokens (for conversion)
 */
function buildTreeFromPrefix(tokens) {
    const stack = [];
    const reversed = [...tokens].reverse();
    reversed.forEach(token => {
        const node = new TreeNode(token);
        if (isOperator(token)) {
            node.left = stack.pop();
            node.right = stack.pop();
        }
        stack.push(node);
    });
    return stack[0];
}

/**
 * Tree to Postfix
 */
function treeToPostfix(node) {
    if (!node) return [];
    return [...treeToPostfix(node.left), ...treeToPostfix(node.right), node.value];
}

/**
 * Tree to Prefix
 */
function treeToPrefix(node) {
    if (!node) return [];
    return [node.value, ...treeToPrefix(node.left), ...treeToPrefix(node.right)];
}

/**
 * Deep copy a tree structure for state snapshots
 * @param {TreeNode} node
 * @returns {TreeNode|null}
 */
function cloneTree(node) {
    if (!node) return null;
    const newNode = new TreeNode(node.value);
    newNode.id = node.id;
    newNode.left = cloneTree(node.left);
    newNode.right = cloneTree(node.right);
    return newNode;
}

/**
 * Calculate and display postfix and prefix results without building the tree
 */
function showResults() {
    const input = document.getElementById('expressionInput').value;
    const inputType = document.getElementById('inputType').value;
    if (!input.trim()) return;

    let postfixTokens = [];
    let prefixTokens = [];

    try {
        if (inputType === 'infix') {
            postfixTokens = infixToPostfix(input);
            prefixTokens = infixToPrefix(input);
        } else if (inputType === 'postfix') {
            postfixTokens = input.trim().split(/\s+/).filter(t => t);
            const tree = buildTreeFromPostfix(postfixTokens);
            prefixTokens = treeToPrefix(tree);
        } else if (inputType === 'prefix') {
            prefixTokens = input.trim().split(/\s+/).filter(t => t);
            const tree = buildTreeFromPrefix(prefixTokens);
            postfixTokens = treeToPostfix(tree);
        }
    } catch (e) {
        console.error("Parsing error", e);
        return;
    }

    // Update results in UI
    document.getElementById('postfixResult').innerText = postfixTokens.join(' ');
    document.getElementById('prefixResult').innerText = prefixTokens.join(' ');
    return {postfixTokens, prefixTokens};
}

/**
 * Main function to initiate tree building and recording steps
 */
function buildTree(autoStart = true) {
    const res = showResults();
    if (!res) return;

    const {postfixTokens, prefixTokens} = res;
    const inputType = document.getElementById('inputType').value;

    steps = [];
    const stack = [];

    // Step 0: Initial state
    steps.push({
        treeStack: [],
        description: "Start construction",
        highlightToken: null
    });

    if (inputType === 'infix' || inputType === 'postfix') {
        postfixTokens.forEach((token) => {
            if (!isOperator(token)) {
                const node = new TreeNode(token);
                stack.push(node);
                steps.push({
                    treeStack: stack.map(n => cloneTree(n)),
                    description: `Push "${token}"`,
                    highlightToken: token,
                    highlightNodeId: node.id
                });
            } else {
                const node = new TreeNode(token);
                const right = stack.pop();
                const left = stack.pop();
                node.right = right;
                node.left = left;
                stack.push(node);

                steps.push({
                    treeStack: stack.map(n => cloneTree(n)),
                    description: `Push op "${token}"`,
                    highlightToken: token,
                    highlightNodeId: node.id
                });
            }
        });
    } else if (inputType === 'prefix') {
        // Prefix construction: process from right to left
        const reversedPrefix = [...prefixTokens].reverse();
        reversedPrefix.forEach((token) => {
            if (!isOperator(token)) {
                const node = new TreeNode(token);
                stack.push(node);
                steps.push({
                    treeStack: stack.map(n => cloneTree(n)),
                    description: `Push "${token}"`,
                    highlightToken: token,
                    highlightNodeId: node.id
                });
            } else {
                const node = new TreeNode(token);
                const left = stack.pop();
                const right = stack.pop();
                node.left = left;
                node.right = right;
                stack.push(node);

                steps.push({
                    treeStack: stack.map(n => cloneTree(n)),
                    description: `Push op "${token}"`,
                    highlightToken: token,
                    highlightNodeId: node.id
                });
            }
        });
    }

    currentStepIndex = 0;
    renderStep(0);
    updateHistory();
    stopAutoplay();

    if (autoStart) {
        startAutoplay();
    }
}

/**
 * Renders a specific step of the visualization
 * @param {number} index
 */
function renderStep(index) {
    if (index < 0 || index >= steps.length) return;

    const step = steps[index];
    const treeContainer = document.getElementById('treeSvgWrapper');

    // Clear previous SVG
    treeContainer.innerHTML = '';

    const width = 800; // Fixed default width for layout calculation
    const height = 500; // Fixed default height
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    // For expression trees, the final step will have one root.
    // During construction, we'll arrange the roots of trees currently in the stack.
    const roots = step.treeStack;
    if (roots.length === 0) return;

    // Arrange multiple trees horizontally if they exist
    // Smaller gap and start position for more compact look
    const gap = width / (roots.length + 1);
    const renderData = roots.map((root, i) => {
        const x = gap * (i + 1);
        const y = 40;
        // More aggressive reduction of subTreeWidth for smaller overall tree
        const subTreeWidth = roots.length > 1 ? gap * 0.6 : 300;
        return {root, x, y, xOffset: subTreeWidth / 2};
    });

    // We'll render them to the SVG and then adjust SVG size if necessary
    svg.setAttribute("width", width * zoomLevel);
    svg.setAttribute("height", height * zoomLevel);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    treeContainer.appendChild(svg);

    renderData.forEach(data => {
        renderTreeNode(svg, data.root, data.x, data.y, data.xOffset, step.highlightNodeId);
    });

    // Update buttons
    document.getElementById('stepBtn').disabled = index === steps.length - 1 || isPlaying;
}

/**
 * Recursively renders tree nodes and edges
 */
function renderTreeNode(svg, node, x, y, xOffset, highlightId) {
    if (!node) return;

    // Use a smaller radius and gap for smaller tree representation
    const radius = 18;
    const verticalGap = 60;

    // Update SVG dimensions if tree nodes are going outside current view
    const currentWidth = parseInt(svg.getAttribute("width"));
    const currentHeight = parseInt(svg.getAttribute("height"));

    if (x + radius + 100 > currentWidth / zoomLevel) {
        const newWidth = x + radius + 150;
        svg.setAttribute("width", newWidth * zoomLevel);
        svg.setAttribute("viewBox", `0 0 ${newWidth} ${currentHeight / zoomLevel}`);
    }
    if (x - radius - 100 < 0) {
        // Just expanding width is not enough if it goes negative
        // But for now let's just make sure it expands
    }
    if (y + verticalGap + 100 > currentHeight / zoomLevel) {
        const newHeight = y + verticalGap + 150;
        svg.setAttribute("height", newHeight * zoomLevel);
        svg.setAttribute("viewBox", `0 0 ${svg.getAttribute("width") / zoomLevel} ${newHeight}`);
    }

    // Render edges first so they are behind nodes
    if (node.left) {
        const lx = x - xOffset;
        const ly = y + verticalGap;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", y);
        line.setAttribute("x2", lx);
        line.setAttribute("y2", ly);
        line.setAttribute("class", "edge-line");
        svg.appendChild(line);
        renderTreeNode(svg, node.left, lx, ly, xOffset / 2, highlightId);
    }

    if (node.right) {
        const rx = x + xOffset;
        const ry = y + verticalGap;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", y);
        line.setAttribute("x2", rx);
        line.setAttribute("y2", ry);
        line.setAttribute("class", "edge-line");
        svg.appendChild(line);
        renderTreeNode(svg, node.right, rx, ry, xOffset / 2, highlightId);
    }

    // Render node circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", radius);

    let nodeClass = isOperator(node.value) ? "node-operator" : "node-operand";
    if (node.id === highlightId) {
        nodeClass = "node-processing";
    }
    circle.setAttribute("class", `node-circle ${nodeClass}`);
    svg.appendChild(circle);

    // Render text
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y + 5);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "white");
    text.setAttribute("class", "node-text");
    text.textContent = node.value;
    svg.appendChild(text);
}

/**
 * Toggles the autoplay state
 */
function togglePlay() {
    if (isPlaying) {
        stopAutoplay();
    } else {
        startAutoplay();
    }
}

/**
 * Starts the autoplay animation
 */
async function startAutoplay() {
    if (isPlaying || steps.length === 0 || currentStepIndex >= steps.length - 1) {
        if (currentStepIndex >= steps.length - 1) {
            // Reset to beginning if at the end
            currentStepIndex = 0;
            renderStep(0);
            syncHistoryHighlight();
        } else {
            return;
        }
    }

    isPlaying = true;
    updatePlayButton();

    while (isPlaying && currentStepIndex < steps.length - 1) {
        await sleep(1000); // Default speed 1000ms

        if (!isPlaying) break;

        currentStepIndex++;
        renderStep(currentStepIndex);
        syncHistoryHighlight();
    }

    stopAutoplay();
}

/**
 * Stops the autoplay animation
 */
function stopAutoplay() {
    isPlaying = false;
    updatePlayButton();
}

/**
 * Updates Play/Stop button UI
 */
function updatePlayButton() {
    const playBtn = document.getElementById('playBtn');
    if (isPlaying) {
        playBtn.innerHTML = `
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
            </svg>
            Stop
        `;
        playBtn.className = "flex-1 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-bold text-red-600 hover:bg-red-100 transition-all flex items-center justify-center gap-2";
    } else {
        playBtn.innerHTML = `
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"></path>
            </svg>
            Play
        `;
        playBtn.className = "flex-1 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center gap-2";
    }

    // Disable step during play
    document.getElementById('stepBtn').disabled = currentStepIndex === steps.length - 1 || isPlaying;
}


/**
 * Navigation: next step
 */
function nextStep() {
    if (isPlaying) return;
    if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        renderStep(currentStepIndex);
        syncHistoryHighlight();
    }
}

/**
 * Updates the history log panel
 */
function updateHistory() {
    const historyLog = document.getElementById('historyLog');
    historyLog.innerHTML = '';

    steps.forEach((step, index) => {
        const item = document.createElement('div');
        item.className = `p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2 animate-fade-in ${
            index === currentStepIndex
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
        }`;
        item.onclick = () => {
            if (isPlaying) stopAutoplay();
            currentStepIndex = index;
            renderStep(index);
            syncHistoryHighlight();
        };

        item.innerHTML = `
            <span class="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 ${
            index === currentStepIndex ? 'bg-blue-100 text-blue-500' : ''
        }">${index}</span>
            <p class="text-[11px] font-medium truncate">${step.description}</p>
        `;
        historyLog.appendChild(item);
    });
}

/**
 * Highlights the current step in history log
 */
function syncHistoryHighlight() {
    const historyLog = document.getElementById('historyLog');
    const items = historyLog.children;
    for (let i = 0; i < items.length; i++) {
        if (i === currentStepIndex) {
            items[i].className = 'p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 shadow-sm';
            items[i].querySelector('span').className = 'w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-500 shrink-0';
            if (!isPlaying) {
                items[i].scrollIntoView({behavior: 'smooth', block: 'nearest'});
            }
        } else {
            items[i].className = 'p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2 bg-white border-slate-100 text-slate-600 hover:border-slate-200';
            items[i].querySelector('span').className = 'w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0';
        }
    }
}


/**
 * Zoom In
 */
function zoomIn() {
    zoomLevel += 0.1;
    if (zoomLevel > 3) zoomLevel = 3;
    renderStep(currentStepIndex);
}

/**
 * Zoom Out
 */
function zoomOut() {
    zoomLevel -= 0.1;
    if (zoomLevel < 0.3) zoomLevel = 0.3;
    renderStep(currentStepIndex);
}

/**
 * Center tree in container
 */
function centerTree() {
    zoomLevel = 1.0;
    renderStep(currentStepIndex);
    const container = document.getElementById('treeContainer');
    const wrapper = document.getElementById('treeSvgWrapper');
    container.scrollLeft = (wrapper.offsetWidth - container.offsetWidth) / 2;
    container.scrollTop = (wrapper.offsetHeight - container.offsetHeight) / 2;
}

// Initial build
window.onload = () => {
    showResults(); // Just show results on initial load, don't build tree yet
};

// Handle window resize to re-render tree
window.onresize = () => {
    if (currentStepIndex !== -1) {
        renderStep(currentStepIndex);
    }
};