class Stack {
  constructor() {
    this.items = [];
  }
  push(val) {
    this.items.push(val);
  }
  pop() {
    return this.items.pop();
  }
  top() {
    return this.items[this.items.length - 1];
  }
  clear() {
    this.items = [];
  }
  isEmpty() {
    return this.items.length === 0;
  }
  getAll() {
    return [...this.items];
  }
  load(items) {
    this.items = [...items];
  }
}

class Queue {
  constructor() {
    this.items = [];
  }
  enqueue(val) {
    this.items.push(val);
  }
  dequeue() {
    return this.items.shift();
  }
  front() {
    return this.items[0];
  }
  rear() {
    return this.items[this.items.length - 1];
  }
  clear() {
    this.items = [];
  }
  isEmpty() {
    return this.items.length === 0;
  }
  getAll() {
    return [...this.items];
  }
  load(items) {
    this.items = [...items];
  }
}

const stack = new Stack();
const queue = new Queue();
const STORAGE_KEY = "sq_data";

const save = () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      stack: stack.getAll(),
      queue: queue.getAll(),
    }),
  );
};

const load = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data) {
      stack.load(data.stack || []);
      queue.load(data.queue || []);
    }
  } catch (e) {
    console.error("Load failed", e);
  }
  render();
};

const render = () => {
  renderList("stackList", stack.getAll(), true);
  renderList("queueList", queue.getAll(), false);
};

const renderList = (elId, items, isStack) => {
  const list = document.getElementById(elId);
  list.innerHTML =
    items.length === 0
      ? '<div class="text-gray-400 italic text-center p-4">Empty</div>'
      : "";

  items.forEach((item, i) => {
    const div = document.createElement("div");
    const isLast = i === items.length - 1;
    const isFirst = i === 0;
    let badgeText = "";

    if (isStack && isLast) badgeText = "Top";
    else if (!isStack) {
      if (isFirst) badgeText = "Front";
      if (isLast) badgeText = badgeText ? "Front/Rear" : "Rear";
    }

    const classes = badgeText
      ? "bg-blue-600 border-blue-700 text-white font-bold ring-2 ring-blue-400 ring-offset-1"
      : "bg-white border-blue-100 text-gray-700";

    div.className = `${classes} p-3 rounded-md border text-center shadow-sm mb-2 relative flex justify-center items-center transition-all animate-fade-in`;
    div.textContent = item;

    if (badgeText) {
      const badge = document.createElement("span");
      badge.className =
        "absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm";
      badge.textContent = badgeText;
      div.appendChild(badge);
    }
    list.appendChild(div);
  });
};

const getInput = () => {
  const el = document.getElementById("inputValue");
  const val = el.value.trim();
  if (!val) {
    el.focus();
    showToast("Enter a value", "error");
    return null;
  }
  el.value = "";
  el.focus();
  return val;
};

const showToast = (msg, type = "info") => {
  const div = document.createElement("div");
  div.className = `toast ${type}`;
  div.innerHTML = `<span class="${type === "error" ? "text-red-500" : "text-blue-500"} font-bold mr-2">●</span><span>${msg}</span>`;
  document.getElementById("toastContainer").appendChild(div);
  setTimeout(() => div.remove(), 3000);
};

window.addToBoth = () => {
  const val = getInput();
  if (!val) return;
  stack.push(val);
  queue.enqueue(val);
  save();
  render();
};

window.popStack = () => {
  if (stack.isEmpty()) return showToast("Stack Empty", "error");
  stack.pop();
  save();
  render();
};

window.dequeueQueue = () => {
  if (queue.isEmpty()) return showToast("Queue Empty", "error");
  queue.dequeue();
  save();
  render();
};

window.clearStack = () => {
  stack.clear();
  save();
  render();
};
window.clearQueue = () => {
  queue.clear();
  save();
  render();
};

window.toggleStackInput = (show) => {
  const btn = document.getElementById("btnPushTrigger");
  const group = document.getElementById("inputPushStack");
  const input = document.getElementById("valPushStack");
  if (show) {
    btn.classList.add("hidden");
    group.classList.remove("hidden");
    input.focus();
  } else {
    btn.classList.remove("hidden");
    group.classList.add("hidden");
    input.value = "";
  }
};

window.submitPushStack = () => {
  const el = document.getElementById("valPushStack");
  const val = el.value.trim();
  if (!val) {
    showToast("Enter a value", "error");
    el.focus();
    return;
  }
  stack.push(val);
  save();
  render();
  toggleStackInput(false);
};

window.toggleQueueInput = (show) => {
  const btn = document.getElementById("btnEnqueueTrigger");
  const group = document.getElementById("inputEnqueueQueue");
  const input = document.getElementById("valEnqueueQueue");
  if (show) {
    btn.classList.add("hidden");
    group.classList.remove("hidden");
    input.focus();
  } else {
    btn.classList.remove("hidden");
    group.classList.add("hidden");
    input.value = "";
  }
};

window.submitEnqueueQueue = () => {
  const el = document.getElementById("valEnqueueQueue");
  const val = el.value.trim();
  if (!val) {
    showToast("Enter a value", "error");
    el.focus();
    return;
  }
  queue.enqueue(val);
  save();
  render();
  toggleQueueInput(false);
};

window.peekStack = () =>
  stack.isEmpty()
    ? showToast("Stack Empty", "error")
    : showToast(`Top: ${stack.top()}`);
window.peekQueueFront = () =>
  queue.isEmpty()
    ? showToast("Queue Empty", "error")
    : showToast(`Front: ${queue.front()}`);
window.peekQueueRear = () =>
  queue.isEmpty()
    ? showToast("Queue Empty", "error")
    : showToast(`Rear: ${queue.rear()}`);

window.addEventListener("load", () => {
  load();
  document
    .getElementById("inputValue")
    .addEventListener(
      "keypress",
      (e) => e.key === "Enter" && window.addToBoth(),
    );
  document
    .getElementById("valPushStack")
    .addEventListener(
      "keypress",
      (e) => e.key === "Enter" && window.submitPushStack(),
    );
  document
    .getElementById("valEnqueueQueue")
    .addEventListener(
      "keypress",
      (e) => e.key === "Enter" && window.submitEnqueueQueue(),
    );
});
