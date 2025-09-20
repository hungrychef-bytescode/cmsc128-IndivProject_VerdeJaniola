document.addEventListener("DOMContentLoaded", function () {
    const inputBox = document.getElementById("task");
    const taskList = document.getElementById("task-list");

    window.addTask = function () {
        if (inputBox.value.trim() === '') {
            alert("No task added. Please add a task.");
        } else {
            let li = document.createElement("li");
            li.textContent = inputBox.value;
            taskList.appendChild(li);
            inputBox.value = "";
        }
    };
});
