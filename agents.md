# Agent Knowledge Base & Guidelines

This document serves as a repository for valuable prompts, design patterns, coding syntax, and styles used throughout
the CSI105 Project. It aims to ensure consistency and efficiency in future development.

## 🎨 Design Patterns & UI/UX

### Global Styling (Tailwind CSS)

- **Primary Colors**:
    - Blue: `#3b82f6` (Primary), `#1d4ed8` (Hover)
    - Success (Green): `#10b981`
    - Error (Red): `#ef4444`
- **Typography**: Uses the 'Kanit' sans-serif font for a modern look.
- **Background**: Light gray `#f8fafc` for a clean interface.
- **Card-based Layouts**: Projects are presented as interactive cards with subtle hover effects.

### Responsive Design

- **Breakpoints**:
    - Custom `xs` (480px) for very small mobile devices.
    - Standard Tailwind breakpoints (`sm`, `md`, `lg`).
- **Mobile-First Adjustments**:
    - Charts/Visualizers scale down on mobile (e.g., 300px height on desktop vs 200px on mobile).
    - Navigation text/titles are visible on all screens (no `hidden sm:block` for main branding).
    - Sub-navigation links (e.g., "to Workshop") may still use `hidden xs:inline` for optimization.

### Unified Navigation

- Every page features a sticky header with:
    - Branded Project Title.
    - "Back to Workshop" link for easy navigation.
    - "Deep Dive" link for technical documentation.
    - (Optional) Tool-specific controls like Zoom In/Out, Center, and Playback.

---

## 💻 Coding Syntax & Standards

### JavaScript (ES6+)

- **Asynchronous Operations**: Uses `async/await` paired with a `sleep(ms)` utility for animations and step-by-step
  visualizations without blocking the main thread.
- **State Management**: Persistence is achieved via `localStorage` (e.g., `sorting_data` key).
- **DOM Manipulation**: Clean separation between logic and UI rendering (e.g., `renderArray()`, `renderHistory()`).
- **Input Sanitization**: Filters empty tokens and normalizes input for robust expression parsing.

### Documentation (JSDoc)

- All functions should be documented using JSDoc style:
  ```javascript
  /**
   * Explains the purpose of the function.
   * @param {type} paramName - Description of the parameter.
   * @returns {type} Description of the return value.
   */
  ```

---

## 🛠️ Data Structures & Algorithms

### Sorting Visualizer

- **Algorithms Implemented**: Bubble, Selection, Insertion, Shell, Merge, Quick Sort.
- **Step Recording**: Captures state snapshots (array values, active/swapping/sorted indices) to allow bidirectional
  navigation (Previous/Next) and history logs.
- **Complexity Analysis**: Displays Big O notation and step descriptions in real-time.

### Other Structures

- **Linked Lists**: Management tools for node manipulation.
- **Stacks & Queues**: Visual representation of LIFO/FIFO principles.
- **Infix Conversion**: Expression parsing and stack-based conversion logic.
- **Expression Tree**:
    - **Input Formats**: Supports Infix, Postfix, and Prefix expressions.
    - **Step-by-Step Construction**: Interactive history panel with concise step descriptions.
    - **Playback System**: Unified Play and Step controls for automated or manual progression.
    - **Visualization Controls**: Zoom In/Out and Center Tree functionality for handling large structures.
    - **User Flow**: Decoupled "Next" button for conversion results before full tree building.

### Binary Search Tree (BST)

- **Operations**: Insert, Search, Delete, and Traversals (Inorder, Preorder, Postorder).
- **State Recording**: Each structural change (insertion, deletion) or traversal step is recorded with tree snapshots
  and visual highlights.
- **Visual Feedback**: Automatically clears success highlights (green) after an operation finishes to maintain a clean
  state.
- **Traversal Output**: Real-time display of visited nodes in a "1 -> 2 -> 3" format.
- **Dynamic Highlights**: Different colors for processing (blue), success/found (green), and error/deletion (red).
- **Interactive Map**: SVG-based tree with zoom, pan, and centering capabilities.
- **Playback Controls**: Features Play/Stop, manual Step progression, and Skip to Final Step for quick results.
- **Collapsible UI**: Grouped operations (Node Operations, Traversals, Step History) into separate collapsible sections
  to optimize space.

---

## 📝 Valuable Prompts & Instructions

### General Development

- "Create a new visualizer in a separate folder with a clean, responsive layout using Tailwind CSS."
- "Ensure the design matches the existing theme, including the sticky navbar and 'Kanit' font."
- "Separation of concerns: Split logic (e.g., expression conversion) from visualization (e.g., tree building) for better
  UX."

### Specific Visualizer logic

- "Use `async/await` to control the visualization speed."
- "Implement a step-by-step history system that stores state snapshots in `localStorage` for persistence."
- "For mobile view, adjust the chart size and ensure the container handles overflow gracefully."
- "Ensure SVG-based trees are scrollable and dynamically resize to fit their contents."

### Refactoring & Maintenance

- "Add detailed JSDoc comments to functions for easier maintainability."
- "Explain the architecture and why specific patterns (like `async/await`) were used in a header comment."

---

## 🚀 Next Steps & Future Enhancements

- Keep `agents.md` updated as new design patterns or technical breakthroughs occur.
- Refer to this file when adding new features or refactoring existing ones to maintain project integrity.
