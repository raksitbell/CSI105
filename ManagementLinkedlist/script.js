class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor(id, name) {
    this.id = id || Date.now().toString();
    this.name = name || "New List";
    this.head = null;
    this.size = 0;
  }

  push(val) {
    const node = new Node(val);
    if (!this.head) this.head = node;
    else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }
    this.size++;
  }

  unshift(val) {
    const node = new Node(val);
    node.next = this.head;
    this.head = node;
    this.size++;
  }

  pop() {
    if (!this.head) return null;
    if (!this.head.next) {
      const val = this.head.value;
      this.head = null;
      this.size--;
      return val;
    }
    let current = this.head;
    while (current.next.next) current = current.next;
    const val = current.next.value;
    current.next = null;
    this.size--;
    return val;
  }

  shift() {
    if (!this.head) return null;
    const val = this.head.value;
    this.head = this.head.next;
    this.size--;
    return val;
  }

  get(index) {
    if (index < 0 || index >= this.size) return null;
    let current = this.head;
    for (let i = 0; i < index; i++) current = current.next;
    return current.value;
  }

  set(index, val) {
    if (index < 0 || index >= this.size) return false;
    let current = this.head;
    for (let i = 0; i < index; i++) current = current.next;
    current.value = val;
    return true;
  }

  toArray() {
    const nodes = [];
    let current = this.head;
    while (current) {
      nodes.push(current.value);
      current = current.next;
    }
    return nodes;
  }

  fromArray(arr) {
    this.head = null;
    this.size = 0;
    arr.forEach((val) => this.push(val));
  }

  toString() {
    const arr = this.toArray();
    return arr.length ? arr.join(" → ") + " → null" : "null";
  }
}

let lists = [];
const STORAGE_KEY = "ll_data";

const save = () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      lists.map((l) => ({
        id: l.id,
        name: l.name,
        items: l.toArray(),
      })),
    ),
  );
};

const load = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    lists = data.map((d) => {
      const l = new LinkedList(d.id, d.name);
      l.fromArray(d.items);
      return l;
    });
  } catch (e) {
    console.error("Load failed", e);
  }
  render();
};

const $ = (id) => document.getElementById(id);

const render = () => {
  const tbody = $("listBody");
  tbody.innerHTML = "";

  if (lists.length === 0) {
    $("emptyState").classList.remove("hidden");
    return;
  }
  $("emptyState").classList.add("hidden");

  lists.forEach((list) => {
    const tr = document.createElement("tr");
    tr.className = "bg-white border-b hover:bg-blue-50/50 transition-colors";
    tr.innerHTML = `
            <td class="w-4 p-4">
                <input type="checkbox" value="${list.id}" class="list-checkbox w-4 h-4 text-blue-600 rounded bg-white border-blue-200">
            </td>
            <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">${list.name} <span class="text-xs text-gray-400">(${list.size})</span></td>
            <td class="px-6 py-4 font-mono text-xs text-blue-600 overflow-hidden text-ellipsis">${list.toString()}</td>
        `;
    tbody.appendChild(tr);
  });
};

const getSelected = () => {
  const checked = [...document.querySelectorAll(".list-checkbox:checked")].map(
    (c) => c.value,
  );
  return lists.filter((l) => checked.includes(l.id));
};

window.toggleActionPanel = (action) => {
  const panel = $("actionPanel");
  const inputs = $("panelInputs").children;
  const selected = getSelected();

  [...inputs].forEach((el) => el.classList.add("hidden"));
  $("panelDetailsOutput").classList.add("hidden");
  $("panelDescription").classList.add("hidden");

  if (action !== "create" && selected.length === 0)
    return showToast("Select a list", "error");

  $("panelActionTitle").textContent = action;
  $("panelSelectedLists").textContent =
    action === "create" ? "New" : `${selected.length} Selected`;

  if (action === "create") $("panelListName").classList.remove("hidden");
  else if (["push", "unshift"].includes(action))
    $("panelValue").classList.remove("hidden");
  else if (action === "set") {
    $("panelIndex").classList.remove("hidden");
    $("panelValue").classList.remove("hidden");
  } else if (action === "get") $("panelIndex").classList.remove("hidden");
  else if (action === "details") {
    $("panelDetailsOutput").classList.remove("hidden");
    $("panelDetailsOutput").textContent = selected
      .map((l) => `${l.name}: [${l.toArray().join(", ")}]`)
      .join("\n");
  } else if (action === "delete") {
    $("panelDescription").classList.remove("hidden");
    $("panelDescription").textContent = `Delete ${selected.length} lists?`;
  }

  panel.dataset.action = action;
  panel.classList.remove("hidden");
  const firstInput = $("panelInputs").querySelector("input:not(.hidden)");
  if (firstInput) firstInput.focus();
};

window.hideActionPanel = () => $("actionPanel").classList.add("hidden");

window.confirmAction = () => {
  const action = $("actionPanel").dataset.action;
  const selected = getSelected();
  const ids = selected.map((l) => l.id);
  const val = $("panelValue").value;
  const idx = parseInt($("panelIndex").value);
  const name = $("panelListName").value;

  if (action === "create") {
    if (!name) return showToast("Name required", "error");
    lists.push(new LinkedList(null, name));
  } else if (["push", "unshift"].includes(action)) {
    if (!val) return showToast("Value required", "error");
    selected.forEach((l) => l[action](val));
  } else if (["pop", "shift"].includes(action)) {
    selected.forEach((l) => l[action]());
  } else if (action === "set") {
    if (isNaN(idx) || !val) return showToast("Index & Value required", "error");
    selected.forEach((l) => l.set(idx, val));
  } else if (action === "get") {
    if (isNaN(idx)) return showToast("Index required", "error");
    $("panelDetailsOutput").classList.remove("hidden");
    $("panelDetailsOutput").textContent = selected
      .map((l) => `${l.name}[${idx}] = ${l.get(idx)}`)
      .join("\n");
  } else if (action === "delete") {
    lists = lists.filter((l) => !ids.includes(l.id));
  }

  save();
  render();

  if (action !== "delete" && action !== "create") {
    document.querySelectorAll(".list-checkbox").forEach((cb) => {
      if (ids.includes(cb.value)) cb.checked = true;
    });
  }

  if (["create", "delete"].includes(action)) hideActionPanel();
  $("panelValue").value = "";
  $("panelListName").value = "";
  $("panelIndex").value = "";
};

window.toggleAll = (source) => {
  document
    .querySelectorAll(".list-checkbox")
    .forEach((c) => (c.checked = source.checked));
};

const showToast = (msg, type = "info") => {
  const div = document.createElement("div");
  div.className = `toast ${type}`;
  div.innerHTML = `<span class="${type === "error" ? "text-red-500" : "text-blue-500"} font-bold mr-2">●</span><span>${msg}</span>`;
  $("toastContainer").appendChild(div);
  setTimeout(() => div.remove(), 3000);
};

window.addEventListener("keydown", (e) => {
  if ($("actionPanel").classList.contains("hidden")) return;
  if (e.key === "Escape") hideActionPanel();
  if (e.key === "Enter") confirmAction();
});

window.addEventListener("load", load);
