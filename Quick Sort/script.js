// script.js for Quick Sort Workshop

document.addEventListener("DOMContentLoaded", () => {
  // --- State ---
  let originalArray = [];
  let stateFrames = [];
  let currentFrameIndex = -1;
  let isPlaying = false;
  let playInterval = null;
  let baseSpeed = 500;

  // --- DOM Elements ---
  const els = {
    arrayInput: document.getElementById("arrayInput"),
    btnGenerate: document.getElementById("btnGenerate"),
    btnSort: document.getElementById("btnSort"),
    btnReset: document.getElementById("btnReset"),
    btnResetMobile: document.getElementById("btnResetMobile"),
    arrayContainer: document.getElementById("arrayContainer"),
    statusTitle: document.getElementById("statusTitle"),
    statusSubtitle: document.getElementById("statusSubtitle"),
    playbackControls: document.getElementById("playbackControls"),
    stepCounter: document.getElementById("stepCounter"),
    btnPrev: document.getElementById("btnPrev"),
    btnNext: document.getElementById("btnNext"),
    btnPlayPause: document.getElementById("btnPlayPause"),
    btnSkipRound: document.getElementById("btnSkipRound"),
    btnSpeed1x: document.getElementById("btnSpeed1x"),
    btnSpeed2x: document.getElementById("btnSpeed2x"),
    logContainer: document.getElementById("logContainer"),
    logContent: document.getElementById("logContent"),
    btnToggleLog: document.getElementById("btnToggleLog"),
  };

  let playSpeed = 600;

  // --- Helpers ---
  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "";
    if (type === "success")
      icon =
        '<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
    else if (type === "error")
      icon =
        '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    else
      icon =
        '<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function generateRandomArray(size = 8) {
    const arr = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 90) + 10);
    }
    els.arrayInput.value = arr.join(", ");
    renderInitialArray(arr);
  }

  function parseInput() {
    const val = els.arrayInput.value;
    if (!val.trim()) return [];
    const arr = val.split(",").map((x) => parseInt(x.trim(), 10));
    if (arr.some(isNaN)) {
      showToast(
        "Invalid input. Please enter numbers separated by commas.",
        "error",
      );
      return null;
    }
    return arr;
  }

  // --- Visualization Logic ---
  function renderInitialArray(arr) {
    originalArray = [...arr];
    currentFrameIndex = -1;
    stateFrames = [];
    resetPlaybackState();

    els.arrayContainer.innerHTML = "";
    const maxVal = Math.max(...arr, 1);

    arr.forEach((val) => {
      const MathmaxFixed = Math.max((val / maxVal) * 100, 10);
      const heightPct = isNaN(MathmaxFixed) ? 10 : MathmaxFixed;

      const wrapper = document.createElement("div");
      wrapper.className =
        "array-bar-container w-8 sm:w-12 md:w-16 flex-shrink-0";

      const valueLabel = document.createElement("div");
      valueLabel.className = "bar-value";
      valueLabel.textContent = val;

      const bar = document.createElement("div");
      bar.className = "array-bar";
      bar.style.height = `${heightPct}%`;

      const indicatorArea = document.createElement("div");
      indicatorArea.className = "indicator-container";

      wrapper.appendChild(valueLabel);
      wrapper.appendChild(bar);
      wrapper.appendChild(indicatorArea);
      els.arrayContainer.appendChild(wrapper);
    });

    els.statusTitle.textContent = "Waiting for input array...";
    els.statusSubtitle.textContent =
      "Enter an array and click Start to visualize Quick Sort.";
    els.logContainer.classList.add("hidden");
    els.playbackControls.classList.add("opacity-50", "pointer-events-none");

    // Disable reset, enable sort
    els.btnReset.classList.add("hidden");
    els.btnResetMobile.classList.add("hidden");
    els.btnSort.classList.remove("hidden");
    els.arrayInput.disabled = false;
    els.btnGenerate.disabled = false;
  }

  function renderFrame(frameIndex) {
    if (frameIndex < 0 || frameIndex >= stateFrames.length) return;
    const frame = stateFrames[frameIndex];

    els.stepCounter.textContent = `Step: ${frameIndex} / ${stateFrames.length - 1}`;
    els.statusTitle.textContent = frame.title;
    els.statusSubtitle.textContent = frame.description;

    // Update logs
    els.logContent.innerHTML = "";
    let allLogs = [];
    for (let i = 0; i <= frameIndex; i++) {
      if (stateFrames[i].logs) {
        allLogs = allLogs.concat(stateFrames[i].logs);
      }
    }

    allLogs.forEach((log) => {
      const p = document.createElement("div");
      if (log.startsWith("___") || log.startsWith("Round")) {
        p.className =
          "font-bold text-gray-800 mt-2 border-t border-gray-100 pt-2";
      } else if (log.startsWith("Pivot:")) {
        p.className = "text-indigo-600 font-semibold";
      } else if (log.startsWith("Step")) {
        p.className = "text-gray-700 font-medium mt-1";
      } else if (log.startsWith("Do:")) {
        p.className =
          "text-gray-600 pl-4 border-l-2 border-gray-200 ml-1 py-0.5 whitespace-pre-wrap";
      } else if (log.startsWith("Result:")) {
        p.className = "text-emerald-600 font-semibold mb-2 text-[0.8rem]";
      } else {
        p.className = "text-gray-600";
      }
      p.textContent = log;
      els.logContent.appendChild(p);
    });
    // Scroll to bottom of log
    els.logContent.scrollTop = els.logContent.scrollHeight;

    // Render Array
    els.arrayContainer.innerHTML = "";
    const maxVal = Math.max(...frame.arr, 1);

    frame.arr.forEach((val, i) => {
      const MathmaxFixed = Math.max((val / maxVal) * 100, 10);
      const heightPct = isNaN(MathmaxFixed) ? 10 : MathmaxFixed;

      const wrapper = document.createElement("div");
      wrapper.className =
        "array-bar-container w-8 sm:w-12 md:w-16 flex-shrink-0";

      const valueLabel = document.createElement("div");
      valueLabel.className = "bar-value";
      valueLabel.textContent = val;

      const bar = document.createElement("div");
      bar.className = "array-bar";
      bar.style.height = `${heightPct}%`;

      // Highlight swapped elements
      if (frame.swapped && frame.swapped.includes(i)) {
        bar.classList.add("highlight-swap");
        bar.style.backgroundColor = "#d8b4fe"; // purple-300
        bar.style.borderColor = "#a855f7"; // purple-500
      }
      // Sorted elements
      if (frame.isFinal) {
        bar.classList.add("sorted");
      }

      const indicatorArea = document.createElement("div");
      indicatorArea.className = "indicator-container";

      frame.tasks.forEach((task, tIdx) => {
        if (i >= task.low && i <= task.high) {
          bar.style.backgroundColor = "#bfdbfe"; // blue-200 to show active bounding box slightly
        }

        let labels = [];
        if (i === task.pivot_pos)
          labels.push({
            text: frame.tasks.length > 1 ? `P${tIdx + 1}` : "P",
            cls: "pivot",
          });
        if (i === task.R) labels.push({ text: "R", cls: "r" });
        if (i === task.F) labels.push({ text: "F", cls: "f" });

        labels.forEach((lbl) => {
          const span = document.createElement("span");
          span.className = `indicator ${lbl.cls}`;
          span.textContent = lbl.text;
          indicatorArea.appendChild(span);
        });
      });

      wrapper.appendChild(valueLabel);
      wrapper.appendChild(bar);
      wrapper.appendChild(indicatorArea);
      els.arrayContainer.appendChild(wrapper);
    });

    // Update button states
    els.btnPrev.disabled = frameIndex === 0;
    els.btnNext.disabled = frameIndex === stateFrames.length - 1;

    if (frameIndex === stateFrames.length - 1) {
      pause();
      els.btnPlayPause.textContent = "Done";
      els.btnPlayPause.disabled = true;
      els.logContainer.classList.remove("hidden");
    } else {
      els.btnPlayPause.disabled = false;
    }
  }

  function formatArrayWithLabels(arr, tasks) {
    let res = [];
    for (let i = 0; i < arr.length; i++) {
      let labelParts = [];
      tasks.forEach((task, tIdx) => {
        if (i >= task.low && i <= task.high) {
          if (i === task.pivot_pos)
            labelParts.push(tasks.length > 1 ? `(P${tIdx + 1})` : `(P)`);
          if (i === task.R) labelParts.push(`(R)`);
          if (i === task.F) labelParts.push(`(F)`);
        }
      });
      res.push(`${arr[i]}${labelParts.join("")}`);
    }
    return `[ ${res.join(", ")} ]`;
  }

  // --- Sorting Algorithm Logic (Ported from Python) ---
  function processTasksStep(arr, tasks) {
    let madeMoves = false;
    let swappedIndices = [];
    let doLogs = [];

    for (let t_idx = 0; t_idx < tasks.length; t_idx++) {
      let task = tasks[t_idx];
      let R = task.R;
      let F = task.F;
      let pivot_pos = task.pivot_pos;

      if (R !== F) {
        madeMoves = true;
        if (pivot_pos === F) {
          // Pivot at (F) - Ascending Logic
          if (arr[R] > arr[F]) {
            doLogs.push(
              `Task ${t_idx + 1}: Pivot at F (${arr[F]}), R(${arr[R]}) > F(${arr[F]}) -> Swap and F -= 1`,
            );
            let temp = arr[R];
            arr[R] = arr[F];
            arr[F] = temp;
            swappedIndices.push(R, F);
            task.pivot_pos = R;
            task.F -= 1;
          } else if (arr[R] < arr[F]) {
            doLogs.push(
              `Task ${t_idx + 1}: Pivot at F (${arr[F]}), R(${arr[R]}) < F(${arr[F]}) -> R += 1`,
            );
            task.R += 1;
          } else {
            doLogs.push(
              `Task ${t_idx + 1}: Pivot at F (${arr[F]}), R(${arr[R]}) == F(${arr[F]}) -> R += 1`,
            );
            task.R += 1;
          }
        } else {
          // Pivot point at (R) - Ascending Logic
          if (arr[R] > arr[F]) {
            doLogs.push(
              `Task ${t_idx + 1}: Pivot at R (${arr[R]}), R(${arr[R]}) > F(${arr[F]}) -> Swap and R += 1`,
            );
            let temp = arr[R];
            arr[R] = arr[F];
            arr[F] = temp;
            swappedIndices.push(R, F);
            task.pivot_pos = F;
            task.R += 1;
          } else if (arr[R] < arr[F]) {
            doLogs.push(
              `Task ${t_idx + 1}: Pivot at R (${arr[R]}), R(${arr[R]}) < F(${arr[F]}) -> F -= 1`,
            );
            task.F -= 1;
          } else {
            doLogs.push(
              `Task ${t_idx + 1}: Pivot at R (${arr[R]}), R(${arr[R]}) == F(${arr[F]}) -> F -= 1`,
            );
            task.F -= 1;
          }
        }
      }
    }
    return { madeMoves, swappedIndices, doLogs };
  }

  function generateQuickSortStates(inputArray) {
    let arr = [...inputArray];
    let frames = [];

    let queue = [
      {
        low: 0,
        high: arr.length - 1,
        R: 0,
        F: arr.length - 1,
        pivot_pos: arr.length - 1,
      },
    ];
    let roundNum = 1;

    frames.push({
      arr: [...arr],
      tasks: JSON.parse(JSON.stringify(queue)),
      title: "Initial State",
      description:
        "Starting array. Setting up initial partition covering the whole array.",
      logs: [],
      swapped: [],
      isFinal: false,
    });

    while (queue.length > 0) {
      let activeTasks = queue;
      queue = [];

      let pivotVals = activeTasks
        .map((t, idx) =>
          activeTasks.length > 1
            ? `${arr[t.pivot_pos]}(P${idx + 1})`
            : `${arr[t.pivot_pos]}(P)`,
        )
        .join(", ");
      let roundLogs = [
        `Round ${roundNum}: [ ${arr.join(", ")} ]`,
        `Pivot: ${pivotVals}`,
      ];

      let stepNum = 1;

      frames.push({
        arr: [...arr],
        tasks: JSON.parse(JSON.stringify(activeTasks)),
        title: `Round ${roundNum} Started`,
        description: `Pivots selected: ${pivotVals}`,
        logs: [...roundLogs],
        swapped: [],
        isFinal: false,
      });

      while (activeTasks.some((task) => task.R !== task.F)) {
        let { madeMoves, swappedIndices, doLogs } = processTasksStep(
          arr,
          activeTasks,
        );

        if (madeMoves) {
          let stepFormattedLogs = [
            `Step ${stepNum}:`,
            `Do:\n${doLogs.join("\n")}`,
            `Result: ${formatArrayWithLabels(arr, activeTasks)}`,
          ];

          frames.push({
            arr: [...arr],
            tasks: JSON.parse(JSON.stringify(activeTasks)),
            title: `Round ${roundNum}, Step ${stepNum}`,
            description: `Advancing pointers and swapping if needed.`,
            logs: [...stepFormattedLogs],
            swapped: swappedIndices,
            isFinal: false,
          });
          stepNum++;
        }
      }

      frames.push({
        arr: [...arr],
        tasks: JSON.parse(JSON.stringify(activeTasks)),
        title: `Round ${roundNum} Finished`,
        description: `Pointers met. Partitions resolved.`,
        logs: [`___`],
        swapped: [],
        isFinal: false,
        isRoundEnd: true,
      });

      // Queue next round
      activeTasks.forEach((task) => {
        let resolved_pivot = task.R; // R == F
        if (resolved_pivot - 1 > task.low) {
          queue.push({
            low: task.low,
            high: resolved_pivot - 1,
            R: task.low,
            F: resolved_pivot - 1,
            pivot_pos: resolved_pivot - 1,
          });
        }
        if (resolved_pivot + 1 < task.high) {
          queue.push({
            low: resolved_pivot + 1,
            high: task.high,
            R: resolved_pivot + 1,
            F: task.high,
            pivot_pos: task.high,
          });
        }
      });

      roundNum++;
    }

    frames.push({
      arr: [...arr],
      tasks: [],
      title: "Sorting Complete",
      description: "All elements are successfully sorted!",
      logs: [`Finished! Result: [ ${arr.join(", ")} ]`],
      swapped: [],
      isFinal: true,
    });

    return frames;
  }

  // --- Playback Controls ---
  function resetPlaybackState() {
    pause();
    currentFrameIndex = 0;
    els.btnPlayPause.textContent = "Play";
    els.btnPlayPause.disabled = false;
    els.btnToggleLog.innerHTML =
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
    els.logContent.classList.remove("hidden");
  }

  function play() {
    if (currentFrameIndex >= stateFrames.length - 1) return;
    isPlaying = true;
    els.btnPlayPause.textContent = "Pause";

    playInterval = setInterval(() => {
      if (currentFrameIndex < stateFrames.length - 1) {
        currentFrameIndex++;
        renderFrame(currentFrameIndex);
      } else {
        pause();
      }
    }, playSpeed);
  }

  function pause() {
    isPlaying = false;
    els.btnPlayPause.textContent = "Play";
    clearInterval(playInterval);
  }

  function setSpeed(multi) {
    if (multi === 1) {
      playSpeed = 600;
      els.btnSpeed1x.classList.add("bg-blue-50", "text-blue-600");
      els.btnSpeed1x.classList.remove("text-gray-500", "hover:bg-gray-50");
      els.btnSpeed2x.classList.remove("bg-blue-50", "text-blue-600");
      els.btnSpeed2x.classList.add("text-gray-500", "hover:bg-gray-50");
    } else {
      playSpeed = 200;
      els.btnSpeed2x.classList.add("bg-blue-50", "text-blue-600");
      els.btnSpeed2x.classList.remove("text-gray-500", "hover:bg-gray-50");
      els.btnSpeed1x.classList.remove("bg-blue-50", "text-blue-600");
      els.btnSpeed1x.classList.add("text-gray-500", "hover:bg-gray-50");
    }
    if (isPlaying) {
      pause();
      play();
    }
  }

  // --- Event Listeners ---
  els.btnGenerate.addEventListener("click", () => {
    generateRandomArray(8);
  });

  els.arrayInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") els.btnSort.click();
  });

  els.btnSort.addEventListener("click", () => {
    const arr = parseInput();
    if (!arr || arr.length === 0) {
      showToast("Please enter an array first", "error");
      return;
    }

    originalArray = [...arr];
    stateFrames = generateQuickSortStates(arr);

    els.arrayInput.disabled = true;
    els.btnGenerate.disabled = true;
    els.btnSort.classList.add("hidden");
    els.btnReset.classList.remove("hidden");
    els.btnResetMobile.classList.remove("hidden");

    els.playbackControls.classList.remove("opacity-50", "pointer-events-none");
    els.logContainer.classList.remove("hidden");

    resetPlaybackState();
    renderFrame(0);
    showToast("Sorting sequence generated! Press Play to start.", "success");
  });

  const handleReset = () => {
    if (originalArray.length > 0) {
      renderInitialArray(originalArray);
    } else {
      els.arrayInput.value = "";
      els.arrayContainer.innerHTML = "";
      els.statusTitle.textContent = "Waiting for input array...";
      els.statusSubtitle.textContent =
        "Enter an array and click Start to visualize Quick Sort.";
    }
  };
  els.btnReset.addEventListener("click", handleReset);
  els.btnResetMobile.addEventListener("click", handleReset);

  els.btnPlayPause.addEventListener("click", () => {
    if (isPlaying) pause();
    else play();
  });

  els.btnNext.addEventListener("click", () => {
    pause();
    if (currentFrameIndex < stateFrames.length - 1) {
      currentFrameIndex++;
      renderFrame(currentFrameIndex);
    }
  });

  els.btnSkipRound.addEventListener("click", () => {
    pause();
    let nextIdx = currentFrameIndex + 1;
    while (
      nextIdx < stateFrames.length &&
      !stateFrames[nextIdx].isRoundEnd &&
      !stateFrames[nextIdx].isFinal
    ) {
      nextIdx++;
    }
    if (nextIdx < stateFrames.length) {
      currentFrameIndex = nextIdx;
      renderFrame(currentFrameIndex);
    }
  });

  els.btnPrev.addEventListener("click", () => {
    pause();
    if (currentFrameIndex > 0) {
      currentFrameIndex--;
      renderFrame(currentFrameIndex);
    }
  });

  els.btnSpeed1x.addEventListener("click", () => setSpeed(1));
  els.btnSpeed2x.addEventListener("click", () => setSpeed(2));

  els.btnToggleLog.addEventListener("click", () => {
    els.logContent.classList.toggle("hidden");
    if (els.logContent.classList.contains("hidden")) {
      els.btnToggleLog.innerHTML =
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 15l-7-7-7 7"></path></svg>';
    } else {
      els.btnToggleLog.innerHTML =
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
    }
  });

  // Init
  const initialDefault = [44, 78, 22, 7, 98, 56, 34, 2, 38, 35, 45];
  els.arrayInput.value = initialDefault.join(", ");
  renderInitialArray(initialDefault);
});
