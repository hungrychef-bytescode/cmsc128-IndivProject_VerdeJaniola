import { sendRequest } from './api.js';
import { showToast } from './toast.js';
import { fetchTasks } from './ui.js';

export function openEditModal(task) {
  const modal = document.getElementById("editModal");
  modal.style.display = "block";

  document.getElementById("edit-task").value = task.task;
  document.getElementById("edit-timestamp").value = task.timestamp?.slice(0, 16);
  document.getElementById("edit-priority").value = task.priority;
  document.getElementById("edit-status").value = task.status;
  document.getElementById("edit-due-date").value = task.due_date?.slice(0, 16) || "";

  document.getElementById("submit-edit").onclick = () => {
    const updatedTask = {
      task: document.getElementById("edit-task").value,
      timestamp: document.getElementById("edit-timestamp").value,
      priority: document.getElementById("edit-priority").value,
      status: parseInt(document.getElementById("edit-status").value),
      due_date: document.getElementById("edit-due-date").value
    };

    sendRequest(`/tasks/${task.id}`, "PUT", updatedTask).then(() => {
      showToast("Task updated");
      modal.style.display = "none";
      fetchTasks();
    });
  };
}

export function bindModalEvents() {
  const modal = document.getElementById("editModal");
  const closeBtn = document.querySelector(".close");

  closeBtn.onclick = () => modal.style.display = "none";
  window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
}
