let tasks = [];

document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
});

window.addTask = function () {
    const inputBox = document.getElementById("task");
    const deadlineInput = document.getElementById("deadline");
    const prioritySelect = document.getElementById("priority");

    if (inputBox.value.trim() === '') {
        alert("No task added. Please add a task.");
        return;
    }

    const task = {
        id: Date.now(),
        text: inputBox.value,
        deadline: deadlineInput.value,
        priority: prioritySelect.value,
        completed: false,
        dateAdded: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    renderTasks();

    inputBox.value = "";
    deadlineInput.value = "";
    prioritySelect.value = "medium";
    
    showToast("Task added successfully!");
}

function renderTasks() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = '';

    tasks.forEach(function(task) {
        let li = document.createElement("li");
        if (task.completed) {
            li.classList.add("completed");
        }

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.onchange = function() {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        };
        li.appendChild(checkbox);

        // Task text
        const span = document.createElement("span");
        span.className = "task-text";
        span.innerHTML = task.text;
        li.appendChild(span);

        // Priority badge
        const priorityBadge = document.createElement("span");
        priorityBadge.className = `priority-badge priority-${task.priority}`;
        priorityBadge.textContent = task.priority.toUpperCase();
        li.appendChild(priorityBadge);

        // Deadline display
        if (task.deadline) {
            const deadlineSpan = document.createElement("span");
            deadlineSpan.className = "deadline-display";
            deadlineSpan.textContent = "📅 " + formatDate(task.deadline);
            li.appendChild(deadlineSpan);
        }

        // Actions container
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "task-actions";

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.className = "btn-edit";
        editBtn.textContent = "Edit";
        editBtn.onclick = function () {
            const currentText = task.text;
            const newText = prompt("Edit your task:", currentText);
            if (newText !== null && newText.trim()) {
                task.text = newText.trim();
                saveTasks();
                renderTasks();
                showToast("Task updated!");
            }
        };

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn-delete";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = function () {
            if (confirm("Are you sure you want to delete this task?")) {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
                showToast("Task deleted successfully");
            }
        };

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(actionsDiv);

        taskList.appendChild(li);
    });
}

window.sortTasks = function() {
    const sortBy = document.getElementById('sortBy').value;

    tasks.sort((a, b) => {
        let compareA, compareB;

        if (sortBy === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            compareA = priorityOrder[a.priority] || 0;
            compareB = priorityOrder[b.priority] || 0;
            // High priority first (descending)
            return compareB - compareA;
        } else if (sortBy === 'deadline') {
            compareA = a.deadline || '9999-12-31';
            compareB = b.deadline || '9999-12-31';
            // Earliest deadline first (ascending)
            return compareA.localeCompare(compareB);
        } else { // dateAdded
            compareA = a.dateAdded;
            compareB = b.dateAdded;
            // Most recent first (descending)
            return compareB.localeCompare(compareA);
        }
    });
    
    renderTasks();
    showToast('Tasks sorted!');
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day}, ${hours}:${minutes}`;
}

function saveTasks() {
    // Tasks stored in memory during session
}

function loadTasks() {
    // Tasks persist in memory array
    renderTasks();
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translate(-50%, -50%)";
    }, 100);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translate(-50%, -50%) translateY(20px)";
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Enter key support
document.addEventListener("DOMContentLoaded", function() {
    const taskInput = document.getElementById("task");
    if (taskInput) {
        taskInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                addTask();
            }
        });
    }
});