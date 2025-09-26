document.addEventListener("DOMContentLoaded", function () {
    const inputBox = document.getElementById("task");
    const taskList = document.getElementById("task-list");
    let taskCount = 0; 

    window.addTask = function () {
        if (inputBox.value.trim() === '') {
            alert("No task added. Please add a task.");
            return;
        }

        let li = document.createElement("li");
        //li.draggable = "true";
        
        const span = document.createElement("span");
        span.textContent = inputBox.value;
        li.appendChild(span);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = function () {
            if (confirm("Are you sure you want to delete this task?")) {
                li.remove();
            }
        };
        
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = function () {
            const newText = prompt("Edit your task:", span.textContent);
            if (newText !== null) span.textContent = newText.trim();
        };

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
        inputBox.value = "";
        }
    document.getElementById("add-task-btn").addEventListener("click", addTask);
});