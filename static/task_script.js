/* ===== COLLABORATION FEATURE FUNCTIONS ===== */
/* Add these functions to the END of your task_script.js file */

// Global variables for collaboration
let currentListId = null;
let allLists = { personal: [], collaborative: [] };
let isOwner = false;

// Function to get current list ID (used by addTask and getTasks)
window.getCurrentListId = function() {
    return currentListId;
};

// Load all lists when page loads (modify existing DOMContentLoaded)
// Replace the existing DOMContentLoaded listener with this:
document.addEventListener("DOMContentLoaded", function () {
    // Load lists first
    loadAllLists();
    
    const taskInput = document.getElementById("task");
    if (taskInput) {
        taskInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                addTask();
            }
        });
    }
});

// Load all lists (personal and collaborative)
async function loadAllLists() {
    try {
        const response = await fetch('/lists');
        const data = await response.json();
        
        if (data.success) {
            allLists = data.lists;
            updateListSelector();
            
            // Auto-select first available list
            if (allLists.personal.length > 0) {
                await switchList(allLists.personal[0].id);
            } else if (allLists.collaborative.length > 0) {
                await switchList(allLists.collaborative[0].id);
            } else {
                // No lists exist, prompt to create one
                console.log("No lists found. Create your first list!");
            }
        }
    } catch (error) {
        console.error('Error loading lists:', error);
        showToast('Failed to load lists');
    }
}

// Update the list selector dropdown
function updateListSelector() {
    const selector = document.getElementById('listSelector');
    selector.innerHTML = '';
    
    // Add personal lists
    if (allLists.personal.length > 0) {
        const personalGroup = document.createElement('optgroup');
        personalGroup.label = '📁 My Lists';
        allLists.personal.forEach(list => {
            const option = document.createElement('option');
            option.value = list.id;
            option.textContent = list.name + (list.is_collab ? ' 👥' : '');
            personalGroup.appendChild(option);
        });
        selector.appendChild(personalGroup);
    }
    
    // Add collaborative lists
    if (allLists.collaborative.length > 0) {
        const collabGroup = document.createElement('optgroup');
        collabGroup.label = '👥 Shared With Me';
        allLists.collaborative.forEach(list => {
            const option = document.createElement('option');
            option.value = list.id;
            option.textContent = list.name + ' (shared)';
            collabGroup.appendChild(option);
        });
        selector.appendChild(collabGroup);
    }

    // If no lists, show message
    if (allLists.personal.length === 0 && allLists.collaborative.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'No lists yet - Create one!';
        option.disabled = true;
        selector.appendChild(option);
    }
}

// Switch to a different list
async function switchList(listId) {
    try {
        const response = await fetch(`/lists/${listId}/switch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentListId = listId;
            
            // Update UI
            document.getElementById('listSelector').value = listId;
            
            // Find list name and check if owner
            let listName = 'My Tasks';
            isOwner = false;
            
            const personalList = allLists.personal.find(l => l.id == listId);
            const collabList = allLists.collaborative.find(l => l.id == listId);
            
            if (personalList) {
                listName = personalList.name;
                isOwner = personalList.is_owner;
            } else if (collabList) {
                listName = collabList.name + ' (shared)';
                isOwner = false;
            }
            
            document.getElementById('currentListName').textContent = listName;
            
            // Reload tasks for this list
            getTasks();
            showToast('Switched to ' + listName);
        } else {
            showToast('Failed to switch list');
        }
    } catch (error) {
        console.error('Error switching list:', error);
        showToast('Failed to switch list');
    }
}

// Switch list from selector
function switchListFromSelector() {
    const listId = document.getElementById('listSelector').value;
    if (listId) {
        switchList(listId);
    }
}

// Open create list modal
function openCreateListModal() {
    document.getElementById('createListModal').classList.add('active');
    document.getElementById('newListName').value = '';
    document.getElementById('isCollabCheckbox').checked = false;
}

// Create new list
async function createList() {
    const listName = document.getElementById('newListName').value.trim();
    const isCollab = document.getElementById('isCollabCheckbox').checked;
    
    if (!listName) {
        alert('Please enter a list name');
        return;
    }
    
    try {
        const response = await fetch('/lists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: listName,
                is_collab: isCollab
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('List created successfully!');
            closeModal('createListModal');
            await loadAllLists();
            await switchList(data.list_id);
        } else {
            alert('Failed to create list: ' + data.error);
        }
    } catch (error) {
        console.error('Error creating list:', error);
        alert('Failed to create list. Please try again.');
    }
}

// Open members modal
async function openMembersModal() {
    if (!currentListId) {
        alert('Please select a list first');
        return;
    }
    
    if (!isOwner) {
        alert('Only the list owner can manage members');
        return;
    }
    
    document.getElementById('membersModal').classList.add('active');
    await loadMembers();
}

// Load members of current list
async function loadMembers() {
    const memberList = document.getElementById('memberList');
    memberList.innerHTML = '<p style="text-align: center; color: #999;">Loading members...</p>';
    
    try {
        const response = await fetch(`/lists/${currentListId}/members`);
        const data = await response.json();
        
        if (data.success) {
            memberList.innerHTML = '';
            
            // Show owner
            const ownerDiv = document.createElement('div');
            ownerDiv.className = 'member-item';
            ownerDiv.innerHTML = `
                <div class="member-info">
                    <div class="member-name">${data.owner.full_name || data.owner.username}</div>
                    <div class="member-email">${data.owner.email}</div>
                </div>
                <span class="owner-badge">OWNER</span>
            `;
            memberList.appendChild(ownerDiv);
            
            // Show members
            if (data.members.length === 0) {
                const noMembers = document.createElement('p');
                noMembers.textContent = 'No members yet. Add members using the form above.';
                noMembers.style.textAlign = 'center';
                noMembers.style.color = '#999';
                noMembers.style.marginTop = '20px';
                memberList.appendChild(noMembers);
            } else {
                data.members.forEach(member => {
                    const memberDiv = document.createElement('div');
                    memberDiv.className = 'member-item';
                    memberDiv.innerHTML = `
                        <div class="member-info">
                            <div class="member-name">${member.full_name || member.username}</div>
                            <div class="member-email">${member.email}</div>
                        </div>
                        ${isOwner ? `<button class="remove-member-btn" onclick="removeMember(${member.id})">Remove</button>` : ''}
                    `;
                    memberList.appendChild(memberDiv);
                });
            }
        } else {
            memberList.innerHTML = `<p style="text-align: center; color: #ef4444;">Error: ${data.error}</p>`;
        }
    } catch (error) {
        console.error('Error loading members:', error);
        memberList.innerHTML = '<p style="text-align: center; color: #ef4444;">Failed to load members</p>';
    }
}

// Add member to current list
async function addMember() {
    const username = document.getElementById('memberUsername').value.trim();
    
    if (!username) {
        alert('Please enter a username');
        return;
    }
    
    if (!isOwner) {
        alert('Only the list owner can add members');
        return;
    }
    
    try {
        const response = await fetch(`/lists/${currentListId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message);
            document.getElementById('memberUsername').value = '';
            await loadMembers();
        } else {
            alert('Failed to add member: ' + data.error);
        }
    } catch (error) {
        console.error('Error adding member:', error);
        alert('Failed to add member. Please try again.');
    }
}

// Remove member from current list
async function removeMember(memberId) {
    if (!confirm('Are you sure you want to remove this member?')) {
        return;
    }
    
    try {
        const response = await fetch(`/lists/${currentListId}/members/${memberId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Member removed successfully');
            await loadMembers();
        } else {
            alert('Failed to remove member: ' + data.error);
        }
    } catch (error) {
        console.error('Error removing member:', error);
        alert('Failed to remove member. Please try again.');
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});