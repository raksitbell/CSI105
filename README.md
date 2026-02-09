# CSI105 Workshop : Management LinkedList

A modern, light-themed web dashboard for managing linked lists, visualizing data structures, and performing various operations. Built with HTML5, JavaScript (ES6+), and Tailwind CSS.

## Features

### 🌟 Core Operations
- **Push / Add Back**: Add an element to the end of the list.
- **Unshift / Add Front**: Add an element to the front of the list.
- **Pop / Drop Back**: Remove the last element.
- **Shift / Drop Front**: Remove the first element.
- **Set**: Update the value at a specific index.
- **Delete**: Remove entire lists (batch delete supported).

### 🔍 Search & Inspect
- **Get Index**: Search for a value and find its index. Results shown in an Alert.
- **View Details**: Inspect the deep structure of your lists. Shows size and recursive node pointers (e.g., `[index: 0, value: "A"] → [index: 1, value: "B"] → null`).

### 🎨 User Experience
- **Inline Action Panel**: A context-aware panel appears below the toolbar for smooth interaction. It stays open for repeated actions (like pushing multiple items).
- **Toast Notifications**: Get immediate visual feedback for every action (Success, Error, Info) with detailed messages (e.g., "Added 'X' to List A, List B").
- **Persistence**: Lists are automatically saved to local storage.
- **Responsive Design**: Clean light theme styled with Tailwind CSS, working on mobile and desktop.

## Setup
Simply open `index.html` in any modern web browser. No build steps required as Tailwind CSS is loaded via CDN.

## Author
**Raksit Phothong** (68037294)
