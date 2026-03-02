# Workshop: Management Linked List

> CSI105T Data Structures — Author: 68037294 Raksit Phothong

## Overview

An interactive workshop for learning **Linked List** data structures through hands-on operations. This project uses vanilla JavaScript with OOP to implement a singly linked list and a management interface to create, modify, and delete multiple lists.

## Features

### 1. Create Linked List with OOP (JavaScript Class Node)

- **`Node` class** — Stores a `value` and a pointer (`next`) to the next node.
- **`LinkedList` class** — Manages a chain of nodes with `head`, `size`, `name`, and `id` properties.
- Each list is a standalone instance, making it easy to manage multiple lists at once.

### 2. Management (Create / Delete)

- **Create** — Enter a name and create a new linked list. It is stored in memory and saved to `localStorage`.
- **Delete** — Select one or more lists using checkboxes and delete them. The UI updates instantly.

### 3. Core Operations

| Operation       | Description                                  |
| --------------- | -------------------------------------------- |
| `push(val)`     | Add a node to the **end** of the list        |
| `unshift(val)`  | Add a node to the **front** of the list      |
| `pop()`         | Remove the last node                         |
| `shift()`       | Remove the first node                        |
| `get(index)`    | Retrieve a value at a specific index         |
| `set(index, v)` | Update the value at a specific index         |

### 4. View Details

- Select a list and click **Details** to view all nodes with their index and value.
- Data is displayed in a clean panel inside the table interface.

## File Structure

```
Management Linkedlist/
├── index.html      # Main workshop UI
├── style.css       # Workshop-specific animations
├── script.js       # LinkedList & Node classes + UI logic
├── deepdive.html   # Tech deep dive: step-by-step code walkthrough
└── README.md       # This file
```

## How to Run

1. Open `index.html` in any modern browser.
2. No build tools, frameworks, or servers required.
3. Data is saved to `localStorage` automatically.

## Tech Deep Dive

Open **[deepdive.html](deepdive.html)** for a visual, step-by-step explanation of how every part of the code works — with real code examples from this project.
