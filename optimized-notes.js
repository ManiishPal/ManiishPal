/**
 * Optimized Notes Application
 * Addresses performance bottlenecks from the original implementation
 */

class NotesApp {
    constructor() {
        this.notesContainer = document.querySelector(".notes-container");
        this.createBtn = document.querySelector(".btn");
        this.debounceTimer = null;
        this.debounceDelay = 300; // 300ms debounce delay
        
        this.init();
    }

    init() {
        if (!this.notesContainer || !this.createBtn) {
            console.error("Required DOM elements not found");
            return;
        }

        // Check localStorage availability
        if (!this.isLocalStorageAvailable()) {
            console.warn("localStorage is not available. Notes will not persist.");
        }

        this.loadNotes();
        this.attachEventListeners();
    }

    // Check if localStorage is available
    isLocalStorageAvailable() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Load notes from localStorage with error handling
    loadNotes() {
        try {
            const savedNotes = localStorage.getItem("notes");
            if (savedNotes) {
                this.notesContainer.innerHTML = savedNotes;
            }
        } catch (error) {
            console.error("Error loading notes:", error);
        }
    }

    // Debounced localStorage update to prevent excessive writes
    updateStorage() {
        if (!this.isLocalStorageAvailable()) return;

        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Set new timer
        this.debounceTimer = setTimeout(() => {
            try {
                localStorage.setItem("notes", this.notesContainer.innerHTML);
            } catch (error) {
                console.error("Error saving notes:", error);
                // Handle quota exceeded error
                if (error.name === 'QuotaExceededError') {
                    alert('Storage quota exceeded. Please delete some notes.');
                }
            }
        }, this.debounceDelay);
    }

    // Create new note with optimized DOM manipulation
    createNote() {
        // Use DocumentFragment for efficient DOM manipulation
        const fragment = document.createDocumentFragment();
        
        const inputBox = document.createElement("p");
        const deleteImg = document.createElement("img");
        
        // Set attributes efficiently
        inputBox.className = "input-box";
        inputBox.contentEditable = "true";
        inputBox.setAttribute("data-note-id", Date.now()); // Add unique identifier
        
        deleteImg.src = "images/delete.png";
        deleteImg.alt = "Delete note";
        deleteImg.className = "delete-btn";
        
        // Build structure
        inputBox.appendChild(deleteImg);
        fragment.appendChild(inputBox);
        
        // Single DOM operation
        this.notesContainer.appendChild(fragment);
        
        // Focus on the new note
        inputBox.focus();
        
        // Update storage after creating note
        this.updateStorage();
    }

    // Delete note with proper cleanup
    deleteNote(noteElement) {
        if (!noteElement) return;
        
        // Remove from DOM
        noteElement.remove();
        
        // Update storage
        this.updateStorage();
    }

    // Event delegation for better performance
    attachEventListeners() {
        // Single event listener for create button
        this.createBtn.addEventListener("click", () => {
            this.createNote();
        });

        // Event delegation for notes container
        this.notesContainer.addEventListener("click", (e) => {
            this.handleNotesClick(e);
        });

        // Event delegation for input events (more efficient than keyup)
        this.notesContainer.addEventListener("input", (e) => {
            this.handleNotesInput(e);
        });

        // Handle paste events for better UX
        this.notesContainer.addEventListener("paste", (e) => {
            // Delay update to allow paste to complete
            setTimeout(() => {
                this.updateStorage();
            }, 0);
        });
    }

    // Handle click events on notes
    handleNotesClick(e) {
        const target = e.target;
        
        // Handle delete button clicks
        if (target.tagName === "IMG" && target.classList.contains("delete-btn")) {
            e.preventDefault();
            this.deleteNote(target.parentElement);
        }
    }

    // Handle input events (more efficient than keyup)
    handleNotesInput(e) {
        const target = e.target;
        
        // Only handle input from note elements
        if (target.classList.contains("input-box")) {
            this.updateStorage();
        }
    }

    // Method to clean up resources (useful for SPA)
    destroy() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Remove event listeners if needed
        // (In this case, they'll be cleaned up when elements are removed)
    }
}

// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const notesApp = new NotesApp();
    
    // Expose globally for debugging (optional)
    window.notesApp = notesApp;
});

// Additional utility functions for further optimization

// Intersection Observer for lazy loading (if many notes)
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Load content when note comes into view
                    const noteElement = entry.target;
                    // Implement lazy loading logic here
                }
            });
        });
        
        // Observe notes for lazy loading
        document.querySelectorAll('.input-box').forEach((note) => {
            observer.observe(note);
        });
    }
}

// Performance monitoring (optional)
function measurePerformance() {
    if ('performance' in window) {
        // Measure localStorage operations
        const start = performance.now();
        localStorage.getItem('notes');
        const end = performance.now();
        console.log(`localStorage read took ${end - start} milliseconds`);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotesApp;
}