document.addEventListener("DOMContentLoaded", function () {
    const inputBox = document.getElementById("task");
    const taskList = document.getElementById("task-list");
    let taskCount = 0; 

    // Load tasks from localStorage on page load
    loadTasks();

    window.addTask = function () {
        if (inputBox.value.trim() === '') {
            alert("No task added. Please add a task.");
            return;
        }

        let li = document.createElement("li");
        //li.draggable = "true";
        
        const span = document.createElement("span");
        span.innerHTML = "• " + inputBox.value;
        li.appendChild(span);

        // Add due date input
        const dueDateInput = document.createElement("input");
        dueDateInput.type = "datetime-local";
        li.appendChild(dueDateInput);

        // Add mark as done button
        const doneBtn = document.createElement("button");
        doneBtn.textContent = "Mark Done";
        doneBtn.onclick = function () {
            li.classList.toggle("completed");
            if (li.classList.contains("completed")) {
                doneBtn.textContent = "Undo";
            } else {
                doneBtn.textContent = "Mark Done";
            }
            saveTasks();
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = function () {
            if (confirm("Are you sure you want to delete this task?")) {
                li.remove();
                saveTasks();
                showToast("Task deleted successfully");
            }
        };
        
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = function () {
            const currentText = span.innerHTML.replace("• ", "");
            const newText = prompt("Edit your task:", currentText);
            if (newText !== null) {
                span.innerHTML = "• " + newText.trim();
                saveTasks();
            }
        };

        li.appendChild(doneBtn);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
        inputBox.value = "";
        
        // Save tasks after adding
        saveTasks();
    }

    // Function to save tasks to localStorage
    function saveTasks() {
        const tasks = [];
        const taskItems = taskList.querySelectorAll("li");
        
        taskItems.forEach(function(li) {
            const span = li.querySelector("span");
            const dueDateInput = li.querySelector("input[type='datetime-local']");
            const isCompleted = li.classList.contains("completed");
            
            // Remove bullet point when saving to avoid duplicates
            const cleanText = span.innerHTML.replace("• ", "");
            
            tasks.push({
                text: cleanText,
                dueDate: dueDateInput.value,
                completed: isCompleted
            });
        });
        
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Function to load tasks from localStorage
    function loadTasks() {
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            
            tasks.forEach(function(task) {
                let li = document.createElement("li");
                
                const span = document.createElement("span");
                span.innerHTML = "• " + task.text;
                if (task.completed) {
                    li.classList.add("completed");
                }
                li.appendChild(span);

                // Add due date input with saved value
                const dueDateInput = document.createElement("input");
                dueDateInput.type = "datetime-local";
                dueDateInput.value = task.dueDate || "";
                dueDateInput.onchange = function() {
                    saveTasks();
                };
                li.appendChild(dueDateInput);

                // Add mark as done button
                const doneBtn = document.createElement("button");
                doneBtn.textContent = task.completed ? "Undo" : "Mark Done";
                doneBtn.onclick = function () {
                    li.classList.toggle("completed");
                    if (li.classList.contains("completed")) {
                        doneBtn.textContent = "Undo";
                    } else {
                        doneBtn.textContent = "Mark Done";
                    }
                    saveTasks();
                };

                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.onclick = function () {
                    if (confirm("Are you sure you want to delete this task?")) {
                        li.remove();
                        saveTasks();
                        showToast("Task deleted successfully");
                    }
                };
                
                const editBtn = document.createElement("button");
                editBtn.textContent = "Edit";
                editBtn.onclick = function () {
                    const currentText = span.innerHTML.replace("• ", "");
                    const newText = prompt("Edit your task:", currentText);
                    if (newText !== null) {
                        span.innerHTML = "• " + newText.trim();
                        saveTasks();
                    }
                };

                li.appendChild(doneBtn);
                li.appendChild(editBtn);
                li.appendChild(deleteBtn);
                taskList.appendChild(li);
            });
        }
    }

    // Fixed function to show toast notification - CENTERED
    function showToast(message) {
        // Create toast element
        const toast = document.createElement("div");
        toast.className = "toast";  // Add the CSS class!
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Show toast with proper animation (centered)
        setTimeout(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translate(-50%, -50%)";
        }, 100);
        
        // Hide and remove toast after 3 seconds
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

    document.getElementById("add-task-btn").addEventListener("click", addTask);
});