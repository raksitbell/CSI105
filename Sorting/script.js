/**
 * Sorting Visualization Script
 * ----------------------------
 * This script handles the sorting visualization, including algorithm implementations,
 * step-by-step state recording, persistence using localStorage, and UI rendering.
 *
 * WHY USE ASYNCHRONOUS FUNCTIONS?
 * We use `async` and `await` with a `sleep` function to control the pace of the visualization.
 * Sorting algorithms are naturally fast, but to observe the process, we need to pause
 * between comparisons and swaps. `await sleep(ms)` allows the browser's main thread
 * to remain responsive (handling UI updates and user clicks) while the algorithm
 * "waits" for the next step, allowing the user to follow the state changes via
 * highlight colors.
 */

let array = [];
let sortingInProgress = false;
let steps = []; // Array of snapshots: { array: [], activeIndices: [], swappingIndices: [], sortedIndices: [], description: "" }
let currentStep = -1;

/**
 * Metadata for supported sorting algorithms including descriptions and complexities.
 */
const ALGO_INFO = {
    bubble: {
        name: "Bubble Sort (การเรียงลำดับแบบฟอง)",
        desc: "Bubble Sort ทำงานโดยการเปรียบเทียบสมาชิกที่อยู่ติดกันทีละคู่และสลับตำแหน่งกันหากเรียงลำดับไม่ถูกต้อง โดยจะทำซ้ำไปเรื่อยๆ จนกว่าข้อมูลทั้งหมดจะเรียงตัวกันอย่างสมบูรณ์",
        complexity: "O(n²)"
    },
    selection: {
        name: "Selection Sort (การเรียงลำดับแบบเลือก)",
        desc: "Selection Sort จะแบ่งข้อมูลออกเป็นสองส่วน คือส่วนที่เรียงลำดับแล้วและส่วนที่ยังไม่ได้เรียง โดยจะค้นหาค่าที่น้อยที่สุดจากส่วนที่ยังไม่ได้เรียงแล้วนำไปต่อท้ายส่วนที่เรียงลำดับแล้วจากซ้ายไปขวา",
        complexity: "O(n²)"
    },
    insertion: {
        name: "Insertion Sort (การเรียงลำดับแบบแทรก)",
        desc: "Insertion Sort จะค่อยๆ สร้างรายการที่เรียงลำดับแล้วทีละรายการ โดยการนำข้อมูลใหม่ไปแทรกในตำแหน่งที่ถูกต้องของข้อมูลที่เรียงไว้ก่อนหน้า แต่อาจมีประสิทธิภาพต่ำเมื่อใช้กับข้อมูลชุดใหญ่",
        complexity: "O(n²)"
    },
    shell: {
        name: "Shell Sort (การเรียงลำดับแบบเชลล์)",
        desc: "Shell Sort เป็นการต่อยอดมาจาก Insertion Sort โดยอนุญาตให้มีการสลับตำแหน่งของข้อมูลที่อยู่ห่างกันได้ หลักการคือการจัดกลุ่มข้อมูลย่อยด้วยระยะห่าง (h) เพื่อให้ข้อมูลในกลุ่มย่อยนั้นเรียงลำดับกันก่อน",
        complexity: "O(n log² n)"
    },
    merge: {
        name: "Merge Sort (การเรียงลำดับแบบผสาน)",
        desc: "Merge Sort เป็นอัลกอริทึมที่มีประสิทธิภาพและมีความเสถียร (Stable) โดยใช้หลักการ 'แบ่งแยกและเอาชนะ' (Divide and Conquer) เพื่อแยกข้อมูลออกเป็นส่วนย่อยแล้วนำกลับมาผสานกันใหม่ในลำดับที่ถูกต้อง",
        complexity: "O(n log n)"
    },
    quick: {
        name: "Quick Sort (การเรียงลำดับแบบรวดเร็ว)",
        desc: "Quick Sort เป็นอัลกอริทึมที่มีประสิทธิภาพสูงโดยใช้หลักการ 'แบ่งแยกและเอาชนะ' หากปรับแต่งอย่างเหมาะสมจะสามารถทำงานได้เร็วกว่า Merge Sort และ Heap Sort ถึง 2-3 เท่า",
        complexity: "O(n log n)"
    }
};

/**
 * Initialize the application: load data from storage and generate initial array if empty.
 */
window.onload = () => {
    loadFromStorage();
    if (array.length === 0) {
        generateRandom();
    } else {
        renderArray();
        renderHistory();
        updateBigO();
    }
};

/**
 * Persists the current state (array, steps, step index, selected algorithm) to localStorage.
 */
function saveToStorage() {
    localStorage.setItem('sorting_data', JSON.stringify({
        array,
        steps,
        currentStep,
        algorithm: document.getElementById('algorithmSelect').value
    }));
}

/**
 * Retrieves and restores the state from localStorage if it exists.
 */
function loadFromStorage() {
    const data = JSON.parse(localStorage.getItem('sorting_data'));
    if (data) {
        array = data.array || [];
        steps = data.steps || [];
        currentStep = data.currentStep !== undefined ? data.currentStep : -1;
        if (data.algorithm) {
            document.getElementById('algorithmSelect').value = data.algorithm;
        }
        document.getElementById('numberInput').value = array.join(',');
    }
}

/**
 * Displays a temporary notification message on the screen.
 * @param {string} message - The text to display.
 * @param {string} type - The style of the toast ('info', 'success', 'error').
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="font-medium">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * Generates 10 random numbers between 10 and 100 and updates the visualizer.
 */
function generateRandom() {
    if (sortingInProgress) return;

    array = [];
    for (let i = 0; i < 10; i++) {
        array.push(Math.floor(Math.random() * 90) + 10);
    }
    document.getElementById('numberInput').value = array.join(',');
    resetStats();
    renderArray();
    document.getElementById('statusLabel').innerText = '';
    document.getElementById('statusLabel').className = 'px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider';
    showToast('Generated 10 random numbers', 'success');
    saveToStorage();
}

/**
 * Parses the comma-separated numeric input from the user and updates the array.
 */
function handleCustomInput() {
    if (sortingInProgress) return;

    const input = document.getElementById('numberInput').value;
    if (!input.trim()) {
        showToast('Please enter some numbers', 'error');
        return;
    }

    const numbers = input.split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n));

    if (numbers.length === 0) {
        showToast('Invalid input format. Use n,n,n...', 'error');
        return;
    }

    array = numbers;
    resetStats();
    renderArray();
    showToast(`Applied ${numbers.length} numbers`, 'success');
    saveToStorage();
}

/**
 * Resets the recorded steps and history log to a clean state.
 */
function resetStats() {
    steps = [];
    currentStep = -1;
    document.getElementById('totalSteps').innerText = '0';
    document.getElementById('currentStepDisplay').innerText = '0';
    document.getElementById('historyLog').innerHTML = '<p class="text-slate-400 text-sm italic">No steps recorded yet...</p>';
    updateNavigationButtons();
}

/**
 * Updates the algorithm description and Big O complexity based on user selection.
 */
function updateBigO() {
    const algo = document.getElementById('algorithmSelect').value;
    const info = ALGO_INFO[algo];
    document.getElementById('algorithmDesc').innerText = info.desc;
    document.getElementById('complexityInfo').innerText = `Big O: ${info.complexity}`;
    saveToStorage();
}

/**
 * Records a new state snapshot into the steps history.
 * @param {Object} snapshot - The current state (array, indices, description).
 */
function addStep(snapshot) {
    steps.push({
        array: [...snapshot.array],
        activeIndices: [...(snapshot.activeIndices || [])],
        swappingIndices: [...(snapshot.swappingIndices || [])],
        sortedIndices: [...(snapshot.sortedIndices || [])],
        description: snapshot.description || ""
    });
    currentStep = steps.length - 1;
    updateStats();
}

/**
 * Updates the UI counters for total steps and current position.
 */
function updateStats() {
    document.getElementById('totalSteps').innerText = steps.length;
    document.getElementById('currentStepDisplay').innerText = currentStep + 1;
    updateNavigationButtons();
}

/**
 * Enables or disables navigation buttons based on current step position.
 */
function updateNavigationButtons() {
    document.getElementById('prevStepBtn').disabled = currentStep <= 0;
    document.getElementById('nextStepBtn').disabled = currentStep >= steps.length - 1;
}

/**
 * Renders the array as vertical bars in the visualizer container.
 * @param {number} stepIndex - Optional index to render a specific historical step.
 */
function renderArray(stepIndex = -1) {
    const container = document.getElementById('visualizerContainer');
    const display = document.getElementById('arrayDisplay');

    let currentArray = array;
    let activeIndices = [];
    let swappingIndices = [];
    let sortedIndices = [];

    if (stepIndex !== -1 && steps[stepIndex]) {
        currentArray = steps[stepIndex].array;
        activeIndices = steps[stepIndex].activeIndices;
        swappingIndices = steps[stepIndex].swappingIndices;
        sortedIndices = steps[stepIndex].sortedIndices;
    }

    container.innerHTML = '';
    display.innerText = currentArray.join(', ');

    const maxVal = Math.max(...currentArray, 1);

    currentArray.forEach((value, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        const height = (value / maxVal) * (window.innerWidth < 640 ? 200 : 300);
        bar.style.height = `${height}px`;
        bar.innerText = value;

        if (activeIndices.includes(idx)) bar.classList.add('comparing');
        if (swappingIndices.includes(idx)) bar.classList.add('swapping');
        if (sortedIndices.includes(idx)) bar.classList.add('sorted');

        container.appendChild(bar);
    });
}

/**
 * Renders the scrollable history log of all steps performed.
 */
function renderHistory() {
    const historyLog = document.getElementById('historyLog');
    if (steps.length === 0) {
        historyLog.innerHTML = '<p class="text-slate-400 text-sm italic">No steps recorded yet...</p>';
        return;
    }

    historyLog.innerHTML = '';
    steps.forEach((step, idx) => {
        const item = document.createElement('div');
        item.className = `p-2 text-xs rounded-lg cursor-pointer transition-all ${idx === currentStep ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`;
        item.innerHTML = `<span class="font-bold mr-2">Step ${idx + 1}:</span> ${step.description}`;
        item.onclick = () => goToStep(idx);
        historyLog.appendChild(item);
    });
    // Scroll to active step
    const active = historyLog.children[currentStep];
    if (active) active.scrollIntoView({behavior: 'smooth', block: 'nearest'});
}

/**
 * Navigates to a specific step in the history and updates the visualization.
 * @param {number} idx - The index of the step to view.
 */
function goToStep(idx) {
    if (sortingInProgress) return;
    currentStep = idx;
    renderArray(currentStep);
    renderHistory();
    updateStats();
    saveToStorage();
}

/**
 * Navigates to the previous step in history.
 */
function prevStep() {
    if (currentStep > 0) goToStep(currentStep - 1);
}

/**
 * Navigates to the next step in history.
 */
function nextStep() {
    if (currentStep < steps.length - 1) goToStep(currentStep + 1);
}

/**
 * Orchestrates the sorting process by calling the selected algorithm.
 * Handles UI state (disabling buttons) during the sort.
 */
async function startSort() {
    if (sortingInProgress || array.length < 2) return;

    sortingInProgress = true;
    resetStats();

    const btn = document.getElementById('sortBtn');
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
    document.getElementById('statusLabel').innerText = 'Sorting...';
    document.getElementById('statusLabel').className = 'px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider';

    const algo = document.getElementById('algorithmSelect').value;

    // Initial state
    addStep({array: [...array], description: "Initial array"});
    renderArray(currentStep);
    renderHistory();

    if (algo === 'bubble') await bubbleSort();
    else if (algo === 'selection') await selectionSort();
    else if (algo === 'insertion') await insertionSort();
    else if (algo === 'shell') await shellSort();
    else if (algo === 'merge') await mergeSortWrapper();
    else if (algo === 'quick') await quickSortWrapper();

    sortingInProgress = false;
    btn.disabled = false;
    btn.classList.remove('opacity-50', 'cursor-not-allowed');
    document.getElementById('statusLabel').innerText = 'Completed';
    document.getElementById('statusLabel').className = 'px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider';
    showToast('Sorting completed!', 'success');
    saveToStorage();
}

/**
 * Implementation of Bubble Sort algorithm with step recording and animation.
 */
async function bubbleSort() {
    const n = array.length;
    let sortedIndices = [];
    let arr = [...array];

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            addStep({
                array: arr,
                activeIndices: [j, j + 1],
                sortedIndices,
                description: `Comparing ${arr[j]} and ${arr[j + 1]}`
            });
            renderArray(currentStep);
            renderHistory();
            await sleep(400);

            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                addStep({
                    array: arr,
                    swappingIndices: [j, j + 1],
                    sortedIndices,
                    description: `Swapping ${arr[j + 1]} and ${arr[j]}`
                });
                renderArray(currentStep);
                renderHistory();
                await sleep(400);
            }
        }
        sortedIndices.push(n - i - 1);
        addStep({array: arr, sortedIndices, description: `Element ${arr[n - i - 1]} is in its sorted position`});
        renderArray(currentStep);
        renderHistory();
        await sleep(400);
    }
    sortedIndices.push(0);
    addStep({array: arr, sortedIndices, description: "Array is fully sorted"});
    renderArray(currentStep);
    renderHistory();
}

/**
 * Implementation of Selection Sort algorithm with step recording and animation.
 */
async function selectionSort() {
    let n = array.length;
    let arr = [...array];
    let sortedIndices = [];

    for (let i = 0; i < n; i++) {
        let minIdx = i;
        addStep({
            array: arr,
            activeIndices: [i],
            sortedIndices,
            description: `Starting pass ${i + 1}, assuming ${arr[i]} is minimum`
        });
        renderArray(currentStep);
        renderHistory();
        await sleep(400);

        for (let j = i + 1; j < n; j++) {
            addStep({
                array: arr,
                activeIndices: [minIdx, j],
                sortedIndices,
                description: `Comparing current min ${arr[minIdx]} with ${arr[j]}`
            });
            renderArray(currentStep);
            renderHistory();
            await sleep(400);
            if (arr[j] < arr[arr[minIdx] === undefined ? minIdx : minIdx]) { // safety
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            addStep({
                array: arr,
                swappingIndices: [i, minIdx],
                sortedIndices,
                description: `Swapping ${arr[minIdx]} with new minimum ${arr[i]}`
            });
        } else {
            addStep({array: arr, activeIndices: [i], sortedIndices, description: `${arr[i]} is already the minimum`});
        }
        sortedIndices.push(i);
        renderArray(currentStep);
        renderHistory();
        await sleep(400);
    }
    addStep({array: arr, sortedIndices, description: "Array is fully sorted"});
    renderArray(currentStep);
    renderHistory();
}

/**
 * Implementation of Insertion Sort algorithm with step recording and animation.
 */
async function insertionSort() {
    let arr = [...array];
    let n = arr.length;
    let sortedIndices = [0];

    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        addStep({array: arr, activeIndices: [i], sortedIndices, description: `Inserting ${key} into sorted portion`});
        renderArray(currentStep);
        renderHistory();
        await sleep(400);

        while (j >= 0 && arr[j] > key) {
            addStep({
                array: arr,
                activeIndices: [j, j + 1],
                sortedIndices,
                description: `${arr[j]} > ${key}, moving ${arr[j]} right`
            });
            arr[j + 1] = arr[j];
            j = j - 1;
            renderArray(currentStep);
            renderHistory();
            await sleep(400);
        }
        arr[j + 1] = key;
        sortedIndices = Array.from({length: i + 1}, (_, k) => k);
        addStep({array: arr, swappingIndices: [j + 1], sortedIndices, description: `Placed ${key} at index ${j + 1}`});
        renderArray(currentStep);
        renderHistory();
        await sleep(400);
    }
    addStep({array: arr, sortedIndices: Array.from({length: n}, (_, k) => k), description: "Array is fully sorted"});
    renderArray(currentStep);
    renderHistory();
}

/**
 * Implementation of Shell Sort algorithm with step recording and animation.
 */
async function shellSort() {
    let arr = [...array];
    let n = arr.length;
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        addStep({array: arr, description: `Current gap: ${gap}`});
        renderArray(currentStep);
        renderHistory();
        await sleep(400);
        for (let i = gap; i < n; i += 1) {
            let temp = arr[i];
            let j;
            for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
                addStep({
                    array: arr,
                    activeIndices: [j, j - gap],
                    description: `Gap comparison: ${arr[j - gap]} > ${temp}`
                });
                arr[j] = arr[j - gap];
                renderArray(currentStep);
                renderHistory();
                await sleep(400);
            }
            arr[j] = temp;
            addStep({array: arr, swappingIndices: [j], description: `Placed ${temp} after gap-based shifts`});
            renderArray(currentStep);
            renderHistory();
            await sleep(400);
        }
    }
    addStep({array: arr, sortedIndices: Array.from({length: n}, (_, k) => k), description: "Array is fully sorted"});
    renderArray(currentStep);
    renderHistory();
}

/**
 * Wrapper for Merge Sort to initialize the recursive process and record final state.
 */
async function mergeSortWrapper() {
    let arr = [...array];
    await mergeSort(arr, 0, arr.length - 1);
    addStep({
        array: arr,
        sortedIndices: Array.from({length: arr.length}, (_, k) => k),
        description: "Array is fully sorted"
    });
    renderArray(currentStep);
    renderHistory();
}

/**
 * Recursive Merge Sort implementation.
 * @param {number[]} arr - The array to sort.
 * @param {number} l - Left index.
 * @param {number} r - Right index.
 */
async function mergeSort(arr, l, r) {
    if (l >= r) return;
    const m = l + Math.floor((r - l) / 2);
    await mergeSort(arr, l, m);
    await mergeSort(arr, m + 1, r);
    await merge(arr, l, m, r);
}

/**
 * Merges two sub-arrays of arr[].
 * @param {number[]} arr - The array containing sub-arrays.
 * @param {number} l - Left index.
 * @param {number} m - Middle index.
 * @param {number} r - Right index.
 */
async function merge(arr, l, m, r) {
    let n1 = m - l + 1;
    let n2 = r - m;
    let L = new Array(n1);
    let R = new Array(n2);
    for (let i = 0; i < n1; i++) L[i] = arr[l + i];
    for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

    addStep({
        array: arr,
        activeIndices: Array.from({length: r - l + 1}, (_, k) => l + k),
        description: `Merging sub-arrays [${l}...${m}] and [${m + 1}...${r}]`
    });
    renderArray(currentStep);
    renderHistory();
    await sleep(600);

    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        addStep({array: arr, swappingIndices: [k], description: `Placed ${arr[k]} from sub-array`});
        renderArray(currentStep);
        renderHistory();
        await sleep(400);
        k++;
    }
    while (i < n1) {
        arr[k] = L[i];
        i++;
        k++;
        addStep({
            array: arr,
            swappingIndices: [k - 1],
            description: `Placed remaining ${arr[k - 1]} from left sub-array`
        });
        renderArray(currentStep);
        renderHistory();
        await sleep(400);
    }
    while (j < n2) {
        arr[k] = R[j];
        j++;
        k++;
        addStep({
            array: arr,
            swappingIndices: [k - 1],
            description: `Placed remaining ${arr[k - 1]} from right sub-array`
        });
        renderArray(currentStep);
        renderHistory();
        await sleep(400);
    }
}

/**
 * Wrapper for Quick Sort to initialize the recursive process and record final state.
 */
async function quickSortWrapper() {
    let arr = [...array];
    await quickSort(arr, 0, arr.length - 1);
    addStep({
        array: arr,
        sortedIndices: Array.from({length: arr.length}, (_, k) => k),
        description: "Array is fully sorted"
    });
    renderArray(currentStep);
    renderHistory();
}

/**
 * Recursive Quick Sort implementation.
 * @param {number[]} arr - The array to sort.
 * @param {number} low - Starting index.
 * @param {number} high - Ending index.
 */
async function quickSort(arr, low, high) {
    if (low < high) {
        let pi = await partition(arr, low, high);
        await quickSort(arr, low, pi - 1);
        await quickSort(arr, pi + 1, high);
    }
}

/**
 * Partition function for Quick Sort.
 * @param {number[]} arr - The array to partition.
 * @param {number} low - Starting index.
 * @param {number} high - Ending index (pivot index).
 * @returns {Promise<number>} - The partition index.
 */
async function partition(arr, low, high) {
    let pivot = arr[high];
    addStep({array: arr, activeIndices: [high], description: `Choosing pivot: ${pivot}`});
    renderArray(currentStep);
    renderHistory();
    await sleep(600);
    let i = (low - 1);
    for (let j = low; j <= high - 1; j++) {
        addStep({array: arr, activeIndices: [j, high], description: `Comparing ${arr[j]} with pivot ${pivot}`});
        renderArray(currentStep);
        renderHistory();
        await sleep(400);
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            addStep({
                array: arr,
                swappingIndices: [i, j],
                description: `Swapping ${arr[i]} and ${arr[j]} (less than pivot)`
            });
            renderArray(currentStep);
            renderHistory();
            await sleep(400);
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    addStep({array: arr, swappingIndices: [i + 1, high], description: `Placed pivot ${pivot} in correct position`});
    renderArray(currentStep);
    renderHistory();
    await sleep(400);
    return (i + 1);
}

/**
 * Utility function to pause execution for a given duration.
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise} - Resolves after the timeout.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
