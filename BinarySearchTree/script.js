/**
 * Binary Search Tree Visualizer
 * Implements BST operations with step-by-step state recording for visualization.
 */

// --- Global State ---
let root = null;
let steps = [];
let currentStepIndex = -1;
let isPlaying = false;
let animationTimeout = null;
let zoomLevel = 1;

// --- Node Definition ---
class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.id = Math.random().toString(36).substr(2, 9);
    }
}

/**
 * Deep copy of the tree structure for state persistence.
 */
function cloneTree(node) {
    if (!node) return null;
    const newNode = new Node(node.value);
    newNode.id = node.id;
    newNode.left = cloneTree(node.left);
    newNode.right = cloneTree(node.right);
    return newNode;
}

/**
 * Records a snapshot of the current tree state and visual highlights.
 */
function recordStep(description, highlights = {}, traversalText = null) {
    steps.push({
        tree: cloneTree(root),
        description,
        highlights: {...highlights}, // { nodeId: 'processing' | 'success' | 'error' }
        traversalText: traversalText
    });
}

// --- BST Operations ---

/**
 * Inserts a value into the BST and records steps.
 */
async function insertNode(value) {
    if (root === null) {
        root = new Node(value);
        recordStep(`Create root node with value ${value}`, {[root.id]: 'success'});
        return;
    }

    let current = root;
    while (true) {
        recordStep(`Compare ${value} with ${current.value}`, {[current.id]: 'processing'});
        if (value < current.value) {
            if (current.left === null) {
                current.left = new Node(value);
                recordStep(`${value} < ${current.value}, insert to the left`, {[current.left.id]: 'success'});
                break;
            }
            current = current.left;
        } else if (value > current.value) {
            if (current.right === null) {
                current.right = new Node(value);
                recordStep(`${value} > ${current.value}, insert to the right`, {[current.right.id]: 'success'});
                break;
            }
            current = current.right;
        } else {
            recordStep(`Value ${value} already exists in the tree`, {[current.id]: 'error'});
            break;
        }
    }
}

/**
 * Searches for a value in the BST and records steps.
 */
async function searchNode(value) {
    let current = root;
    while (current) {
        recordStep(`Compare ${value} with ${current.value}`, {[current.id]: 'processing'});
        if (value === current.value) {
            recordStep(`Found value ${value}!`, {[current.id]: 'success'});
            return current;
        }
        if (value < current.value) {
            current = current.left;
        } else {
            current = current.right;
        }
    }
    recordStep(`Value ${value} not found in the tree`, {});
    return null;
}

/**
 * Deletes a value from the BST and records steps.
 */
async function deleteNode(value) {
    root = await deleteRecursively(root, value);
}

async function deleteRecursively(node, value) {
    if (!node) {
        recordStep(`Value ${value} not found, nothing to delete`, {});
        return null;
    }

    recordStep(`Compare ${value} with ${node.value}`, {[node.id]: 'processing'});

    if (value < node.value) {
        node.left = await deleteRecursively(node.left, value);
        return node;
    } else if (value > node.value) {
        node.right = await deleteRecursively(node.right, value);
        return node;
    } else {
        // Node found
        recordStep(`Found node ${value} to delete`, {[node.id]: 'error'});

        if (!node.left && !node.right) {
            recordStep(`Node ${value} is a leaf, remove it`, {});
            return null;
        }
        if (!node.left) {
            recordStep(`Node ${value} has only right child, replace with child`, {[node.right.id]: 'success'});
            return node.right;
        }
        if (!node.right) {
            recordStep(`Node ${value} has only left child, replace with child`, {[node.left.id]: 'success'});
            return node.left;
        }

        // Two children: Get inorder successor
        recordStep(`Node ${value} has two children, find inorder successor`, {[node.id]: 'processing'});
        let successor = node.right;
        while (successor.left) {
            recordStep(`Move to left child ${successor.left.value}`, {[successor.left.id]: 'processing'});
            successor = successor.left;
        }
        recordStep(`Inorder successor is ${successor.value}, replace ${value} with ${successor.value}`, {[successor.id]: 'success'});
        node.value = successor.value;
        node.right = await deleteRecursively(node.right, successor.value);
        return node;
    }
}

/**
 * Tree Traversals
 */
let traversalResult = [];

function inorder(node) {
    if (node) {
        inorder(node.left);
        traversalResult.push(node.value);
        recordStep(`Visit node ${node.value}`, {[node.id]: 'success'}, traversalResult.join(' -> '));
        inorder(node.right);
    }
}

function preorder(node) {
    if (node) {
        traversalResult.push(node.value);
        recordStep(`Visit node ${node.value}`, {[node.id]: 'success'}, traversalResult.join(' -> '));
        preorder(node.left);
        preorder(node.right);
    }
}

function postorder(node) {
    if (node) {
        postorder(node.left);
        postorder(node.right);
        traversalResult.push(node.value);
        recordStep(`Visit node ${node.value}`, {[node.id]: 'success'}, traversalResult.join(' -> '));
    }
}

// --- UI Handlers ---

function initSteps() {
    steps = [];
    currentStepIndex = -1;
    updatePlaybackUI();
    document.getElementById('historyLog').innerHTML = '';
}

async function handleBulkInsert() {
    initSteps();
    root = null;
    const input = document.getElementById('bulkInput').value;
    const values = input.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));

    for (const val of values) {
        await insertNode(val);
    }

    if (steps.length > 0) {
        jumpToStep(0);
        startAutoplay();
    }
}

async function handleAddNode() {
    const val = parseInt(document.getElementById('nodeValue').value);
    if (isNaN(val)) return;
    initSteps();
    await insertNode(val);
    jumpToStep(0);
    startAutoplay();
}

async function handleSearchNode() {
    const val = parseInt(document.getElementById('nodeValue').value);
    if (isNaN(val)) return;
    initSteps();
    await searchNode(val);
    jumpToStep(0);
    startAutoplay();
}

async function handleDeleteNode() {
    const val = parseInt(document.getElementById('nodeValue').value);
    if (isNaN(val)) return;
    initSteps();
    await deleteNode(val);
    jumpToStep(0);
    startAutoplay();
}

function handleTraversal(type) {
    if (!root) return;
    initSteps();
    traversalResult = [];
    document.getElementById('traversalOutput').textContent = '-';

    if (type === 'inorder') inorder(root);
    else if (type === 'preorder') preorder(root);
    else if (type === 'postorder') postorder(root);

    jumpToStep(0);
    startAutoplay();
}

function clearTraversal() {
    document.getElementById('traversalOutput').textContent = '-';
}

// --- Visualization ---

const NODE_RADIUS = 22;
const LEVEL_HEIGHT = 70;

function renderTree(node, x, y, horizontalGap, highlights) {
    if (!node) return '';

    let html = '';
    const highlightClass = highlights[node.id] ? `node-${highlights[node.id]}` : '';

    // Draw edges to children
    if (node.left) {
        const lx = x - horizontalGap;
        const ly = y + LEVEL_HEIGHT;
        html += `<line x1="${x}" y1="${y}" x2="${lx}" y2="${ly}" class="edge-line" />`;
        html += renderTree(node.left, lx, ly, horizontalGap / 1.8, highlights);
    }
    if (node.right) {
        const rx = x + horizontalGap;
        const ry = y + LEVEL_HEIGHT;
        html += `<line x1="${x}" y1="${y}" x2="${rx}" y2="${ry}" class="edge-line" />`;
        html += renderTree(node.right, rx, ry, horizontalGap / 1.8, highlights);
    }

    // Draw node
    html += `
        <g class="node-group ${highlightClass}" id="node-${node.id}">
            <circle cx="${x}" cy="${y}" r="${NODE_RADIUS}" class="node-circle" />
            <text x="${x}" y="${y}" class="node-text">${node.value}</text>
        </g>
    `;

    return html;
}

function updateVisualization() {
    const mainGroup = document.getElementById('mainGroup');
    const emptyState = document.getElementById('emptyState');

    if (currentStepIndex === -1 || steps.length === 0) {
        mainGroup.innerHTML = '';
        emptyState.style.opacity = '1';
        return;
    }

    emptyState.style.opacity = '0';
    const step = steps[currentStepIndex];
    const svgWidth = document.getElementById('treeSvg').clientWidth || 1000;

    mainGroup.innerHTML = renderTree(step.tree, svgWidth / 2, 50, svgWidth / 4, step.highlights);

    if (step.traversalText) {
        document.getElementById('traversalOutput').textContent = step.traversalText;
    }

    updateHistoryUI();
}

// --- Playback Controls ---

function updatePlaybackUI() {
    const playIcon = document.getElementById('playIcon');
    if (isPlaying) {
        playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>';
    } else {
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"></path>';
    }
    document.getElementById('stepCounter').textContent = `${currentStepIndex + 1}/${steps.length}`;
}

function togglePlay() {
    if (isPlaying) {
        stopAutoplay();
    } else {
        startAutoplay();
    }
}

function startAutoplay() {
    if (currentStepIndex >= steps.length - 1) {
        currentStepIndex = -1;
    }
    isPlaying = true;
    updatePlaybackUI();
    runAnimation();
}

function stopAutoplay() {
    isPlaying = false;
    clearTimeout(animationTimeout);
    updatePlaybackUI();
}

function runAnimation() {
    if (!isPlaying) return;

    if (currentStepIndex < steps.length - 1) {
        stepForward();
        animationTimeout = setTimeout(runAnimation, 1000);
    } else {
        stopAutoplay();
    }
}

function stepForward() {
    if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        updateVisualization();
        updatePlaybackUI();
    }
}

function jumpToStep(index) {
    stopAutoplay();
    currentStepIndex = index;
    updateVisualization();
    updatePlaybackUI();
}

function updateHistoryUI() {
    const historyLog = document.getElementById('historyLog');
    historyLog.innerHTML = '';

    steps.forEach((step, idx) => {
        const isActive = idx === currentStepIndex;
        const item = document.createElement('div');
        item.className = `history-item p-3 mb-2 rounded-xl border transition-all cursor-pointer text-xs ${
            isActive ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-blue-300'
        }`;
        item.onclick = () => jumpToStep(idx);
        item.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isActive ? 'bg-white/20' : 'bg-slate-200'}">${idx + 1}</span>
                <span class="font-medium">${step.description}</span>
            </div>
        `;
        historyLog.appendChild(item);

        if (isActive) {
            item.scrollIntoView({behavior: 'smooth', block: 'nearest'});
        }
    });
}

// --- Zoom & Pan ---

function zoomIn() {
    zoomLevel += 0.1;
    applyZoom();
}

function zoomOut() {
    if (zoomLevel > 0.5) {
        zoomLevel -= 0.1;
        applyZoom();
    }
}

function applyZoom() {
    document.getElementById('mainGroup').style.transform = `scale(${zoomLevel})`;
    document.getElementById('mainGroup').style.transformOrigin = 'top center';
}

function centerTree() {
    zoomLevel = 1;
    applyZoom();
    const container = document.getElementById('treeContainer');
    container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
    container.scrollTop = 0;
}

// Initialize
window.onload = () => {
    centerTree();
    updateVisualization();
};
