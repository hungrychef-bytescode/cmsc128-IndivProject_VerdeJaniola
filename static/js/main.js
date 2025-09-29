import { fetchTasks, handleAddTask, handleSort } from "./ui.js";
import { bindModalEvents } from "./modal.js";

document.addEventListener("DOMContentLoaded", () => {
  fetchTasks();
  document.getElementById("add-task-btn").addEventListener("click", handleAddTask);
  document.getElementById("sort-btn").addEventListener("click", handleSort);
  bindModalEvents();
});
