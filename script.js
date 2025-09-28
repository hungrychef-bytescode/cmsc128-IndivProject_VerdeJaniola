document.addEventListener("DOMContentLoaded", function () {
    const inputBox = document.getElementById("task");
    const taskList = document.getElementById("task-list");
    let taskCount = 0; 

    window.addTask = function () {
        if (inputBox.value.trim() === '') {
            alert("No task added. Please add a task.");
        } else {
            taskCount++; 
            let li = document.createElement("li");
            li.textContent = taskCount + ". " + inputBox.value;
            taskList.appendChild(li);
            inputBox.value = "";
        }
    };
});
