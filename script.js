// --- 1. DATA MODELS ---
        class Node {
            constructor(value) {
                this.value = value;
                this.next = null;
            }
        }

        class LinkedList {
            constructor(name, initialData = []) {
                this.name = name;
                this.head = null;
                this.tail = null;
                this.length = 0;
                
                // Initialize with existing data if present
                if (initialData.length > 0) {
                    initialData.forEach(val => this.push(val, false));
                }
            }

            // Sync UI and Storage after any change
            sync() {
                const data = this.toArray();
                console.log(`LinkedList "${this.name}" updated:`, data);
                
                const row = document.getElementById(`row-${this.name}`);
                if (row) {
                    const dataCell = row.querySelector('.data-cell');
                    if(dataCell) dataCell.textContent = JSON.stringify(data);
                }
                saveAllToLocalStorage();
            }

            // Operations
            push(value, shouldSync = true) {
                const newNode = new Node(value);
                if (!this.head) {
                    this.head = newNode;
                    this.tail = newNode;
                } else {
                    this.tail.next = newNode;
                    this.tail = newNode;
                }
                this.length++;
                if (shouldSync) this.sync();
                return this;
            }

            pop() {
                if (!this.head) return undefined;
                let current = this.head;
                let newTail = current;
                while (current.next) {
                    newTail = current;
                    current = current.next;
                }
                this.tail = newTail;
                this.tail.next = null;
                this.length--;
                if (this.length === 0) {
                    this.head = null;
                    this.tail = null;
                }
                this.sync();
                return current;
            }

            shift() {
                if (!this.head) return undefined;
                const temp = this.head;
                this.head = this.head.next;
                this.length--;
                if (this.length === 0) this.tail = null;
                this.sync();
                return temp;
            }

            unshift(value) {
                const newNode = new Node(value);
                if (!this.head) {
                    this.head = newNode;
                    this.tail = newNode;
                } else {
                    newNode.next = this.head;
                    this.head = newNode;
                }
                this.length++;
                this.sync();
                return this;
            }

            set(index, value) {
                if (!this.head) return false;
                let current = this.head;
                let count = 0;
                while (current) {
                    if (count === Number(index)) {
                        current.value = value;
                        this.sync();
                        return true;
                    }
                    count++;
                    current = current.next;
                }
                return false;
            }

            indexOf(value) {
                let current = this.head;
                let index = 0;
                while (current) {
                    if (current.value === value) return index;
                    current = current.next;
                    index++;
                }
                return -1;
            }

            getDetails() {
                let structure = "";
                
                const buildStructure = (node) => {
                    if (!node) return "null";
                    return `[node: {value: "${node.value}", next: ${buildStructure(node.next)}}]`;
                };

                // Pretty pointer representation requested by user (structure: [index: i, value: "v"])
                const buildPointerStructure = (node, idx = 0) => {
                    if (!node) return "null";
                    return `[index: ${idx}, value: "${node.value}"] → ${buildPointerStructure(node.next, idx + 1)}`;
                };

                return `List: ${this.name}\nSize: ${this.length}\nStructure: ${buildPointerStructure(this.head)}`;
            }

            toArray() {
                const arr = [];
                let current = this.head;
                while (current) {
                    arr.push(current.value);
                    current = current.next;
                }
                return arr;
            }
        }

        // --- 2. GLOBAL STATE ---
        let lists = {};
        let currentAction = null;

        // --- 3. STORAGE ---
        function saveAllToLocalStorage() {
            const storageObj = {};
            for (let name in lists) {
                storageObj[name] = lists[name].toArray();
            }
            localStorage.setItem('csi105_linkedlists', JSON.stringify(storageObj));
            updateEmptyState();
        }

        function loadFromLocalStorage() {
            const savedData = localStorage.getItem('csi105_linkedlists');
            if (savedData) {
                const storageObj = JSON.parse(savedData);
                for (let name in storageObj) {
                    addListToUI(name, storageObj[name]);
                }
            }
            updateEmptyState();
        }

        // --- 4. UI RENDERER ---
        function updateEmptyState() {
            const tbody = document.getElementById('listBody');
            const emptyState = document.getElementById('emptyState');
            if (tbody.children.length === 0) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
            }
        }

        function addListToUI(name, initialData = []) {
            const newList = new LinkedList(name, initialData);
            lists[name] = newList;

            const tableBody = document.getElementById('listBody');
            const row = document.createElement('tr');
            row.id = `row-${name}`;
            row.className = "hover:bg-gray-50 transition-colors group";

            // Row Setup
            row.innerHTML = `
                <td class="w-4 p-4">
                    <div class="flex items-center">
                        <input type="checkbox" name="selectedList" value="${name}" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer">
                    </div>
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">${name}</td>
                <td class="px-6 py-4 font-mono text-blue-600 data-cell">${JSON.stringify(initialData)}</td>
            `;
            
            tableBody.appendChild(row);
            console.log(`Initialized List: ${name}`);
            updateEmptyState();
        }

        function toggleAll(source) {
            const checkboxes = document.querySelectorAll('input[name="selectedList"]');
            checkboxes.forEach(cb => cb.checked = source.checked);
        }

        // --- 5. ACTION PANEL LOGIC ---
        function toggleActionPanel(action) {
            const panel = document.getElementById('actionPanel');
            
            // Toggle closed if clicking same action
            if (currentAction === action && panel.classList.contains('open')) {
                hideActionPanel();
                return;
            }

            currentAction = action;
            const elements = {
                title: document.getElementById('panelActionTitle'),
                desc: document.getElementById('panelDescription'),
                selectedSpan: document.getElementById('panelSelectedLists'),
                inputList: document.getElementById('panelListName'),
                inputIndex: document.getElementById('panelIndex'),
                inputValue: document.getElementById('panelValue'),
                detailsOutput: document.getElementById('panelDetailsOutput'),
                confirmBtn: document.getElementById('panelConfirmBtn')
            };

            // Reset Inputs
            elements.inputList.value = '';
            elements.inputIndex.value = '';
            elements.inputValue.value = '';
            [elements.inputList, elements.inputIndex, elements.inputValue, elements.desc, elements.detailsOutput].forEach(el => el.classList.add('hidden'));

            // Check Selections (unless creating)
            const selectedMetadata = getSelectedListsMetadata();
            if (action !== 'create') {
                if (selectedMetadata.count === 0) {
                    alert("Please select at least one list to operate on.");
                    return; 
                }
                const names = selectedMetadata.names.join(', ');
                elements.selectedSpan.textContent = names.length > 50 ? names.substring(0, 50) + '...' : names;
                elements.selectedSpan.classList.remove('hidden');
            } else {
                elements.selectedSpan.classList.add('hidden');
            }

            // Configure Panel
            const configs = {
                'create': { title: 'Create New List', inputs: [elements.inputList], btn: 'Create', color: 'blue' },
                'push':   { title: 'Push (Add Back)', inputs: [elements.inputValue], btn: 'Push', color: 'emerald' },
                'unshift':{ title: 'Unshift (Add Front)', inputs: [elements.inputValue], btn: 'Unshift', color: 'emerald' },
                'set':    { title: 'Set Value', inputs: [elements.inputIndex, elements.inputValue], btn: 'Update', color: 'blue' },
                'indexOf':{ title: 'Get Index Of', inputs: [elements.inputValue], btn: 'Find', color: 'purple' },
                'details':{ title: 'List Details', inputs: [], btn: 'Close', color: 'indigo' },
                'pop':    { title: 'Pop (Drop Back)', msg: "Remove the last element?", btn: 'Pop', color: 'red' },
                'shift':  { title: 'Shift (Drop Front)', msg: "Remove the first element?", btn: 'Shift', color: 'red' },
                'delete': { title: 'Delete List(s)', msg: "Permanently delete selected lists?", btn: 'Delete', color: 'red' }
            };

            const config = configs[action];
            if (config) {
                elements.title.textContent = config.title;
                if (config.inputs) config.inputs.forEach(el => {
                    el.classList.remove('hidden');
                    if (el === elements.inputIndex) el.focus();
                    else if (el !== elements.inputIndex) el.focus(); // Simple focus logic
                });

                if (action === 'details') {
                    elements.detailsOutput.classList.remove('hidden');
                    // Generate Details Content
                    let output = "";
                    selectedMetadata.names.forEach(name => {
                        output += lists[name].getDetails() + "\n\n";
                    });
                    elements.detailsOutput.textContent = output.trim();
                }

                if (config.msg) {
                    elements.desc.textContent = config.msg;
                    elements.desc.classList.remove('hidden');
                }
                
                elements.confirmBtn.textContent = config.btn;
                // Set Button Color Class
                const colorMap = {
                    'blue': 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300',
                    'emerald': 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300',
                    'red': 'bg-red-600 hover:bg-red-700 focus:ring-red-300',
                    'purple': 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-300',
                    'indigo': 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300'
                };
                elements.confirmBtn.className = `text-white ${colorMap[config.color]} focus:ring-4 font-medium rounded-lg text-sm px-4 py-2 shadow-sm transition-colors`;
            }

            // Show Panel
            panel.classList.add('open');
            // elements.inputList.focus(); // Auto focus if visible logic could be improved here
        }

        function hideActionPanel() {
            const panel = document.getElementById('actionPanel');
            panel.classList.remove('open');
            setTimeout(() => { currentAction = null; }, 300);
        }

        function getSelectedListsMetadata() {
            const selected = document.querySelectorAll('input[name="selectedList"]:checked');
            const names = Array.from(selected).map(cb => cb.value);
            return { count: selected.length, names: names };
        }

        function confirmAction() {
            const value = document.getElementById('panelValue').value.trim();
            const index = document.getElementById('panelIndex').value.trim();
            const listName = document.getElementById('panelListName').value.trim();
            
            // Handle Create
            if (currentAction === 'create') {
                if (!listName) return alert("Please enter a list name");
                if (lists[listName]) return alert("List already exists");
                addListToUI(listName);
                saveAllToLocalStorage();
                showToast(`List "${listName}" created successfully`, 'success');
                hideActionPanel();
                return;
            }

            // Handle Other Actions
            const selectedMetadata = getSelectedListsMetadata();
            if (selectedMetadata.count === 0) { hideActionPanel(); return; }
            
            let successfulLists = [];

            selectedMetadata.names.forEach(name => {
                const list = lists[name];
                let success = false;
                
                switch(currentAction) {
                    case 'delete':
                        delete lists[name];
                        const row = document.getElementById(`row-${name}`);
                        if (row) row.remove();
                        success = true;
                        break;
                    case 'push':
                    case 'unshift':
                        if(value) {
                            list[currentAction](value);
                            success = true;
                        }
                        break;
                    case 'set':
                        if(value && index !== '') {
                            if(list.set(index, value)) success = true;
                        }
                        break;
                    case 'indexOf':
                        if(value) {
                            const idx = list.indexOf(value);
                            alert(`List "${name}": Value "${value}" ${idx !== -1 ? 'found at index ' + idx : 'not found'}`);
                        }
                        break;
                    case 'pop':
                    case 'shift':
                        if(list[currentAction]()) success = true;
                        break;
                }

                if (success) successfulLists.push(name);
            });

            const listNamesStr = successfulLists.join(', ');

            // Trigger Toasts based on action
            if (currentAction === 'delete') {
                showToast(`Deleted: ${listNamesStr}`, 'error');
                saveAllToLocalStorage();
            } else if (['push', 'unshift'].includes(currentAction) && value && successfulLists.length > 0) {
                showToast(`Added "${value}" to ${listNamesStr}`, 'success');
            } else if (['pop', 'shift'].includes(currentAction) && successfulLists.length > 0) {
                showToast(`Removed from ${listNamesStr}`, 'info');
                showToast(`Updated index ${index} in ${listNamesStr}`, 'success');
            }

            // Persistence Logic
            if (currentAction === 'details' || currentAction === 'create') {
                // For 'create' we might want to close, or clear and stay? 
                // User said "always show ... until click hide". 
                // But for 'details' the button is "Close", so we hide.
                // For 'create', keeping it open allows creating multiple lists quickly.
                if (currentAction === 'details') hideActionPanel(); 
                if (currentAction === 'create') document.getElementById('panelListName').value = ''; // Clear input
            } else {
                // For Push/Pop/Set/etc, we keep it open and clear value inputs
                document.getElementById('panelValue').value = '';
                // Don't clear index for 'set' as user might want to set same index again? 
                // Usually repetitive set is rare, but repetitive push is common.
                // Let's clear value.
            }

            // hideActionPanel(); // REMOVED auto-hide
        }

        // --- 7. TOAST NOTIFICATIONS ---
        function showToast(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            let icon = '';
            if (type === 'success') icon = '<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
            else if (type === 'error') icon = '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
            else icon = '<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

            toast.innerHTML = `${icon}<span class="text-sm font-medium">${message}</span>`;
            container.appendChild(toast);

            // Remove from DOM after animation
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // --- 8. INITIALIZATION ---
        window.onload = loadFromLocalStorage;
