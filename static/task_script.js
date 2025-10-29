document.addEventListener("DOMContentLoaded", function () {
    getTasks(null, "desc");
    const taskInput = document.getElementById("task");
    if (taskInput) {
        taskInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                addTask();
            }
        });
    }
});

const addTaskBtn = document.getElementById("addBtn");
addTaskBtn.addEventListener("click", addTask);

async function addTask() {
    const taskInput = document.getElementById("task");
    const dueDateInput = document.getElementById("deadline");
    const prioritySelect = document.getElementById("priority");
    
    const task = taskInput.value.trim();
    const due_date = dueDateInput.value;
    const priority = prioritySelect.value;
    
    if (!task) {
        alert("No task added. Please add a task.");
        return;
    }

    const taskData = {
        task,
        timestamp: new Date().toISOString(),
        priority,
        status: 0,
        due_date: due_date || null
    };

    try {
        const response = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
        });
    
        const result = await response.json();
        console.log("Server response JSON:", result);

        if (result.success) {
            showToast("Task added!");
            taskInput.value = "";
            dueDateInput.value = "";
            prioritySelect.value = "medium";
            getTasks();
        } else {
            console.log("sever worked but task was not added");
        }
    } catch (error) {
        console.error("Add task failed:", error);
    }
};


async function getTasks(sortBy, order) {
    let query = "";

    if (sortBy) {
        query = "?sort=" + sortBy + "&order=" + order;
    } else {
        query = "";
    }
    
    try {
        const response = await fetch(`/tasks${query}`);
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error("Tasks not fetched.", error);
    }
}

function displayTasks(tasks) {
    const taskList = document.getElementById("task-list");
    if (tasks.length === 0) {
        taskList.innerHTML = "<li>No tasks found.</li>";
    } else {
        taskList.innerHTML = "";
    }

    tasks.forEach(task => {
        const li = createTaskElement(task);
        taskList.appendChild(li)
    });
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;
  if (task.status === 1) li.classList.add("completed");

  li.appendChild(createCheckbox(task, li));
  li.appendChild(createTaskText(task, li));
  li.appendChild(createPrioritySelector(task, li));
  li.appendChild(createDeadlinePicker(task, li));
  li.appendChild(createDeleteButton(task, li));

  return li;
}

function createDeleteButton(task, li){
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        
        try {
            const response = await fetch(`/tasks/${task.id}`, {method: "DELETE" });
            const result = await response.json();

            if (response.ok && result.success) {
                li.remove();
                showToast("Task deleted successfully");
            } else {
                alert(result.error || "Failed to delete task.");
            }
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    });
    
    actionsDiv.appendChild(deleteBtn);
    return actionsDiv;
}
function createDeadlinePicker(task, li) {
    const deadlineContainer = document.createElement("span");
    deadlineContainer.className = "deadline-display";
    deadlineContainer.style.cursor = "pointer";

    const emoji = document.createElement("span");
    emoji.textContent = "📅 ";
    deadlineContainer.appendChild(emoji);

    const dateDisplay = document.createElement("span");
    if (task.due_date) {
        dateDisplay.textContent = formatDate(task.due_date);
    } else {
        dateDisplay.textContent = "No date";
    }
            
    dateDisplay.contentEditable = true;
    dateDisplay.style.marginLeft = "4px";
    deadlineContainer.appendChild(dateDisplay);

    const deadlineInput = document.createElement("input");
    deadlineInput.type = "datetime-local";
    deadlineInput.value = task.due_date || "";
    deadlineInput.className = "deadline-input";


    deadlineContainer.addEventListener("click", () => {
        deadlineInput.focus();
        deadlineInput.showPicker?.();
    });

    deadlineInput.addEventListener("change", async () => {
        const newDate = deadlineInput.value;
        try {
            const response = await fetch(`/tasks/${task.id}/due_date`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ due_date: newDate })
            });
            
            task.due_date = newDate;
            dateDisplay.textContent = newDate ? formatDate(newDate) : "No date";
            
            showToast("Due date updated!");
        } catch (err) {
            console.error("Error updating due date:", err);
            deadlineInput.value = task.due_date || "";
             if (task.due_date) {
                dateDisplay.textContent = formatDate(due_date);
            } else {
                dateDisplay.textContent = "No date";
            }
        }
    });
    
    deadlineContainer.appendChild(deadlineInput);
    li.appendChild(deadlineContainer);
    return deadlineContainer;
}

function createPrioritySelector(task, li){
    const prioritySelect = document.createElement("select");
    prioritySelect.className = `priority-badge priority-${task.priority.toLowerCase()}`;

    const highOption = document.createElement("option");
    highOption.value = "High";
    highOption.textContent = "High";
    prioritySelect.appendChild(highOption);

    const mediumOption = document.createElement("option");
    mediumOption.value = "Medium";
    mediumOption.textContent = "Medium";    
    prioritySelect.appendChild(mediumOption);

    const lowOption = document.createElement("option");
    lowOption.value = "Low";
    lowOption.textContent = "Low";
    prioritySelect.appendChild(lowOption);

    prioritySelect.value = task.priority;

    li.appendChild(prioritySelect);

    prioritySelect.addEventListener("change", async () => {
        const newPriority = prioritySelect.value;
        try {
            const response = await fetch(`/tasks/${task.id}/priority`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priority: newPriority })
            });

            task.priority = newPriority;
            prioritySelect.className = `priority-badge priority-${newPriority.toLowerCase()}`;
            showToast("Priority updated!");
        } catch (err) {
            console.error("Error updating priority:", err);
            prioritySelect.value = task.priority;
        }
    });
    return prioritySelect;
}

function createCheckbox(task, li) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.status === 1;

    checkbox.addEventListener("change", async () => {
        let newStatus;
        if (checkbox.checked === true) {
            newStatus = 1;
        } else {
            newStatus = 0;
        }
    
    try {
        const response = await fetch(`/tasks/${task.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            task.status = newStatus;
            li.classList.toggle("completed", checkbox.checked);
            showToast("Status updated!");
        } else {
            console.log("Failed to update status.");
        }
    } catch (err) {
        console.log("Status update failed:", err);
    }
    });
    return checkbox;
}

function createTaskText(task, li) {
  const span = document.createElement("span");
  span.textContent = task.task;
  span.className = "task-text";
  span.tabIndex = 0;
  span.style.cursor = "pointer";

  span.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = task.task;
    input.className = "task-edit-input";
    input.style.fontSize = "inherit";
    input.style.fontFamily = "inherit";
    input.style.width = "100%";

    // Replace span with input
    span.replaceWith(input);
    input.focus();

    let replaced = false; // ✅ ensures replace happens only once

    const finalizeEdit = async (newText) => {
      if (replaced) return;
      replaced = true;

      if (newText && newText !== task.task) {
        try {
          const response = await fetch(`/tasks/${task.id}/task`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task: newText })
          });

          if (!response.ok) throw new Error(`Failed to update task: ${response.status}`);

          task.task = newText;
          span.textContent = newText;
          showToast("Task updated!");
        } catch (err) {
          console.error("Error updating task:", err);
          alert("Could not update task. Try again.");
        }
      }

      // Restore span if input still in DOM
      if (input.parentNode) input.replaceWith(span);
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        finalizeEdit(input.value.trim());
      } else if (e.key === "Escape") {
        finalizeEdit(null);
      }
    });

    input.addEventListener("blur", () => {
      finalizeEdit(input.value.trim());
    });
  });

  return span;
}

const sortSelect = document.getElementById("sortBy");

sortSelect.addEventListener("change", async () => {
    const sortBy = sortSelect.value;
    let order;

    if (sortBy === "due_date") {
        order = "asc";
    } else {
        order = "desc";
    }

    try {
        const response = await fetch(`/tasks?sort=${sortBy}&order=${order}`);
        const tasks = await response.json();
        displayTasks(tasks);
        showToast("Tasks sorted!");
    } catch (e) {
        console.error("failed to get sorted tasks:", e);
    }
});

function formatDate(dateString) {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    
    let ampm;
    if (hours >= 12) {
        ampm = "PM";
    } else {
        ampm = "AM";
    }
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours.toString().padStart(2, "0");
    
    return `${month} ${day}, ${formattedHours}:${minutes} ${ampm}`;
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
    }, 1500);
}