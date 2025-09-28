import { sendRequest } from "./api.js";
import { openEditModal } from "./modal.js";
import { showToast } from "./toast.js";

export function fetchTasks() {
  sendRequest("/tasks", "GET").then(renderTasks);
}

export function handleAddTask() {
  const task = document.getElementById("task").value.trim();
  const dueDate = document.getElementById("due_date").value;
  const priority = document.getElementById("priority").value;

  if (!task) return alert("Please add a task.");

  const taskData = {
    task,
    timestamp: new Date().toISOString(),
    priority,
    status: 0,
    due_date: dueDate || null
  };

  sendRequest("/tasks", "POST", taskData).then(() => {
    showToast("Task added");
    document.getElementById("task").value = "";
    document.getElementById("due_date").value = "";
    document.getElementById("priority").value = "Medium";
    fetchTasks();
  });
}

export function handleSort() {
  const sortType = document.getElementById("sort-select").value;
  const sortOrder = document.getElementById("sort-order").value;

  sendRequest(`/tasks?sort=${sortType}&order=${sortOrder}`, "GET").then(renderTasks);
}

function renderTasks(tasks) {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = tasks.length === 0 ? "<li>No tasks found.</li>" : "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    if (task.status === 1) li.classList.add("completed");

    li.innerHTML = `
      <span>• ${task.task}</span>
      <input type="datetime-local" value="${task.due_date || ''}" />
      <button>${task.status ? "Undo" : "Mark Done"}</button>
      <button>Edit</button>
      <button>Delete</button>
    `;

    const [dueInput, doneBtn, editBtn, deleteBtn] = li.querySelectorAll("input, button");

    dueInput.addEventListener("change", () => {
      task.due_date = dueInput.value;
      sendRequest(`/tasks/${task.id}/due_date`, "PUT", { due_date: task.due_date }).then(() => {
        showToast("Due date updated");
      });
    });

    doneBtn.addEventListener("click", () => {
      task.status = task.status === 1 ? 0 : 1;
      li.classList.toggle("completed");
      doneBtn.textContent = task.status ? "Undo" : "Mark Done";
      sendRequest(`/tasks/${task.id}/status`, "PUT", { status: task.status }).then(() => {
        showToast("Status updated");
      });
    });

    editBtn.addEventListener("click", () => openEditModal(task));

    deleteBtn.addEventListener("click", () => {
      if (confirm("Delete this task?")) {
        sendRequest(`/tasks/${task.id}`, "DELETE").then(() => {
          li.remove();
          showToast("Task deleted");
        });
      }
    });

    taskList.appendChild(li);
  });
}