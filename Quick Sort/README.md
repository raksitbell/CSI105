# Quick Sort Interactive Workshop

Welcome to the Quick Sort project of the Data Structures Workshop! This directory contains an interactive visualizer for the Quick Sort algorithm, specifically designed to demonstrate how a parallel, fixed-pivot Quick Sort operates.

## Overview
Quick Sort is a highly efficient, divide-and-conquer sorting algorithm. It works by selecting a 'pivot' element from the array and partitioning the other elements into two sub-arrays, according to whether they are less than or greater than the pivot. The sub-arrays are then sorted recursively.

This implementation visualizes the process step-by-step, allowing you to clearly see how the `Pointer R` and `Pointer F` scan the partitions and perform swaps.

## How to used
1. Open up `index.html` in your web browser.
2. Enter a comma-separated array of numbers in the input field, or click the **Random** button to generate one.
3. Click **Start Quick Sort** to initialize the sequence.
4. Use the playback controls (**Play**, **Pause**, **Next**, **Prev**) to navigate through each step of the algorithm.
5. Use the **1x Speed** / **2x Speed** buttons to control playback velocity.
6. Check the **Execution Log** box below the animation to read the precise conditions and actions taking place during each step.
7. Click **Skip Round** to bypass step-by-step pointer traversal and jump directly to the end state of that specific partition round.

## "Ascending" Rules (Fixed Pivot at Last Index)
Our unique visualization tracks the pivot explicitly as the last index of any unsorted partition bounding box.
At each step, `Pointer R` and `Pointer F` may occupy the pivot position depending on traversal:

*   **Pivot at (F):** 
    If value at R > value at F: Swap(R,F) and move F left (`F -= 1`).
    Otherwise: Advance R (`R += 1`).
*   **Pivot at (R):**
    If value at R > value at F: Swap(R,F) and move R right (`R += 1`).
    Otherwise: Advance F (`F -= 1`).

When `R` meets `F`, the partition round ends, the pivot is locked in its correct sorted position, and the array splits into new sub-arrays to continue the process.

## Built With
*   Raw HTML, JavaScript, and styled with Tailwind CSS (`Kanit` typeface).
*   No heavy UI frameworks used; rely entirely on native DOM manipulation.
