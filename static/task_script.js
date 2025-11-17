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
const logoutBtn = document.getElementById("log-out-btn")
const profileBtn = document.getElementById("view-profile")

addTaskBtn.addEventListener("click", addTask);

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {

        // Create pop-up
        const popup = document.createElement("div");
        Object.assign(popup.style, {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            padding: "20px 25px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            textAlign: "center",
            zIndex: "9999",
        });

        popup.innerHTML = `
            <p style="margin-bottom: 20px; font-weight:500;">Are you sure you want to log out?</p>
            <button id="confirm-logout" style="margin-right:10px; padding:8px 15px; background:#ec7fb1; color:#fff; border:none; border-radius:8px; cursor:pointer;">Yes</button>
            <button id="cancel-logout" style="padding:8px 15px; background:#ccc; color:#333; border:none; border-radius:8px; cursor:pointer;">No</button>
        `;

        document.body.appendChild(popup);

        // Confirm button
        popup.querySelector("#confirm-logout").addEventListener("click", () => {
            window.location.href = "/logout";
        });

        // Cancel button
        popup.querySelector("#cancel-logout").addEventListener("click", () => {
            if (document.body.contains(popup)) {
                document.body.removeChild(popup);
            }
        });
    });
}

if (profileBtn) {
    profileBtn.addEventListener("click", () => {
        window.location.href = "/profile";}
    )
}

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
        const response = await fetch(`/tasks${query}`, {
            method: "GET",
            credentials: "include" 
        });

        const tasks = await response.json();
        console.log('Fetched tasks:', tasks);
        displayTasks(tasks);
        // console.log("Raw response:", await response.text());
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

// ========================================
// COLLABORATIVE LIST FUNCTIONS
// ========================================

// Load all lists on page load
document.addEventListener("DOMContentLoaded", function () {
    loadAllLists();
    loadActiveListInfo();
});

//on list selector dropdown
async function loadAllLists() {
    try {
        const response = await fetch("/view_collab_lists", {
            method: "GET",
            credentials: "include"
        });

        const result = await response.json();
        
        if (result.success) {
            populateListSelector(result);
        } else {
            console.error("Failed to load lists:", result.message);
        }
    } catch (error) {
        console.error("Error loading lists:", error);
    }
}

// Populate the dropdown with all available lists
function populateListSelector(data) {
    const selector = document.getElementById("listSelector");
    selector.innerHTML = "";

    // Add personal list
    if (data.personal_list) {
        const option = document.createElement("option");
        option.value = data.personal_list.id;
        option.textContent = `📋 ${data.personal_list.name} (Personal)`;
        selector.appendChild(option);
    }

    // Add owned collaborative lists
    if (data.owned_collab_lists && data.owned_collab_lists.length > 0) {
        const ownedGroup = document.createElement("optgroup");
        ownedGroup.label = "My Collaborative Lists";
        
        data.owned_collab_lists.forEach(list => {
            const option = document.createElement("option");
            option.value = list.id;
            option.textContent = `👥 ${list.name} (${list.member_count} members)`;
            ownedGroup.appendChild(option);
        });
        
        selector.appendChild(ownedGroup);
    }

    // Add lists where user is a member
    if (data.member_collab_lists && data.member_collab_lists.length > 0) {
        const memberGroup = document.createElement("optgroup");
        memberGroup.label = "Shared With Me";
        
        data.member_collab_lists.forEach(list => {
            const option = document.createElement("option");
            option.value = list.id;
            option.textContent = `👥 ${list.name} (by ${list.owner})`;
            memberGroup.appendChild(option);
        });
        
        selector.appendChild(memberGroup);
    }

    // Set the current active list as selected
    loadActiveListInfo();
}

// Get current active list info and update UI
async function loadActiveListInfo() {
    try {
        const response = await fetch("/get_active_list", {
            method: "GET",
            credentials: "include"
        });

        const result = await response.json();
        
        if (result.success) {
            // Update the list name display
            const listNameDisplay = document.getElementById("currentListName");
            if (listNameDisplay) {
                listNameDisplay.textContent = result.list_name;
            }

            // Set the selector to the active list
            const selector = document.getElementById("listSelector");
            if (selector) {
                selector.value = result.list_id;
            }

            // Show/hide members button based on if it's a collab list
            const membersBtn = document.querySelector('button[onclick="openMembersModal()"]');
            if (membersBtn) {
                if (result.is_collab && result.is_owner) {
                    membersBtn.style.display = "inline-block";
                } else {
                    membersBtn.style.display = "none";
                }
            }
        }
    } catch (error) {
        console.error("Error loading active list:", error);
    }
}

// Switch to a different list
async function switchListFromSelector() {
    const selector = document.getElementById("listSelector");
    const listId = selector.value;

    if (!listId) return;

    try {
        const response = await fetch(`/switch_list/${listId}`, {
            method: "POST",
            credentials: "include"
        });

        const result = await response.json();

        if (result.success) {
            showToast(`Switched to: ${result.list_name}`);
            
            // Update the list name display
            const listNameDisplay = document.getElementById("currentListName");
            if (listNameDisplay) {
                listNameDisplay.textContent = result.list_name;
            }

            // Reload tasks for the new list
            getTasks();
            
            // Update members button visibility
            loadActiveListInfo();
        } else {
            alert(result.message || "Failed to switch list");
            loadAllLists(); // Reload to reset selector
        }
    } catch (error) {
        console.error("Error switching list:", error);
        alert("Failed to switch list");
    }
}

// Open create list modal
function openCreateListModal() {
    const modal = document.getElementById("createListModal");
    modal.style.display = "flex";
    
    // Clear previous input
    document.getElementById("newListName").value = "";
    document.getElementById("isCollabCheckbox").checked = false;
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "none";
}

// Create a new list
async function createList() {
    const listName = document.getElementById("newListName").value.trim();
    const isCollab = document.getElementById("isCollabCheckbox").checked;

    if (!listName) {
        alert("Please enter a list name");
        return;
    }

    try {
        const response = await fetch("/create_list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                list_name: listName,
                is_collab: isCollab
            })
        });

        const result = await response.json();

        if (result.success) {
            showToast("List created successfully!");
            closeModal("createListModal");
            
            // Reload all lists and switch to the new one
            await loadAllLists();
            
            // The new list is now active, so reload tasks
            getTasks();
            loadActiveListInfo();
        } else {
            alert(result.message || "Failed to create list");
        }
    } catch (error) {
        console.error("Error creating list:", error);
        alert("Failed to create list");
    }
}

// Open members modal
async function openMembersModal() {
    const modal = document.getElementById("membersModal");
    modal.style.display = "flex";
    
    // Clear input
    document.getElementById("memberUsername").value = "";
    
    // Load current members
    await loadMembers();
}

// Load members of current list
async function loadMembers() {
    const memberList = document.getElementById("memberList");
    memberList.innerHTML = '<p style="text-align: center; color: #999;">Loading members...</p>';

    try {
        const response = await fetch("/view_collab_lists", {
            method: "GET",
            credentials: "include"
        });

        const result = await response.json();

        if (result.success) {
            // Get the active list info
            const activeResponse = await fetch("/get_active_list", {
                method: "GET",
                credentials: "include"
            });
            
            const activeResult = await activeResponse.json();
            
            if (activeResult.success) {
                const activeListId = activeResult.list_id;
                
                // Find the active list in owned lists
                const activeList = result.owned_collab_lists.find(list => list.id === activeListId);
                
                if (activeList && activeList.members && activeList.members.length > 0) {
                    memberList.innerHTML = "";
                    
                    activeList.members.forEach(username => {
                        const memberDiv = document.createElement("div");
                        memberDiv.className = "member-item";
                        memberDiv.innerHTML = `
                            <span>👤 ${username}</span>
                        `;
                        memberList.appendChild(memberDiv);
                    });
                } else {
                    memberList.innerHTML = '<p style="text-align: center; color: #999;">No members yet. Add someone!</p>';
                }
            }
        }
    } catch (error) {
        console.error("Error loading members:", error);
        memberList.innerHTML = '<p style="text-align: center; color: #f44336;">Failed to load members</p>';
    }
}

// Add a member to the current list
async function addMember() {
    const usernameInput = document.getElementById("memberUsername");
    const username = usernameInput.value.trim();

    if (!username) {
        alert("Please enter a username or email");
        return;
    }

    try {
        // Get current active list
        const activeResponse = await fetch("/get_active_list", {
            method: "GET",
            credentials: "include"
        });
        
        const activeResult = await activeResponse.json();
        
        if (!activeResult.success) {
            alert("Could not get current list");
            return;
        }

        const response = await fetch("/add_member", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                list_id: activeResult.list_id,
                username_or_email: username
            })
        });

        const result = await response.json();

        if (result.success) {
            showToast("Member added successfully!");
            usernameInput.value = "";
            
            // Reload members list
            await loadMembers();
            
            // Reload all lists to update member count
            await loadAllLists();
        } else {
            alert(result.message || "Failed to add member");
        }
    } catch (error) {
        console.error("Error adding member:", error);
        alert("Failed to add member");
    }
}

// Close modal when clicking outside
window.addEventListener("click", (event) => {
    const createModal = document.getElementById("createListModal");
    const membersModal = document.getElementById("membersModal");
    
    if (event.target === createModal) {
        closeModal("createListModal");
    }
    if (event.target === membersModal) {
        closeModal("membersModal");
    }
});