const commonHeaders = {
  Authorization: localStorage.getItem("token"),
};

const sendMessageButton = document.querySelector("#sendMessage");
const messageInput = document.querySelector("#msg");
const chatMessages = document.getElementById("chatMessages");

const createGroupBtn = document.querySelector("#createGroupBtn");
const createGroupSection = document.querySelector(".create-group-section");
const groupNameInput = document.querySelector("#groupNameInput");
const groupList = document.getElementById("groupList");
const cancelCreateGroupBtn = document.querySelector("#cancelCreateGroupBtn");
const createGroup = document.querySelector("#createGroup");

let currentGroupId = null; // Initialize currentGroupId to null initially

async function fetchGroupsForUser() {
  try {
    // Make a request to fetch all groups for the logged-in user
    const response = await axios.get("http://localhost:3000/api/groups", {
      headers: commonHeaders,
    });
    if (response.status === 200) {
      console.log("Groups fetched successfully");
      // Process the fetched groups, such as displaying them on the UI
      return response.data.groups;
    }
  } catch (error) {
    console.error("Unable to fetch groups:", error.message);
    // Optionally, handle errors such as displaying an error message to the user
  }
}

console.log("present group id::", currentGroupId);
// Function to fetch new messages from the backend based on last message ID
async function fetchNewMessages(groupId, lastMessageId) {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/getmessages?groupId=${groupId}&lastMessageId=${lastMessageId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching new messages:", error);
    throw new Error("Failed to fetch new messages");
  }
}

// Function to update local storage with new messages for a particular group
function updateLocalStorage(messages) {
  try {
    const storedMessages = JSON.parse(localStorage.getItem("messages")) || [];

    const updatedMessages = [...storedMessages, ...messages];
    if (updatedMessages.length > 1000) {
      updatedMessages.splice(0, updatedMessages.length - 10); // Keep only the recent 1000 messages
    }
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
  } catch (error) {
    console.error("Error updating local storage:", error);
  }
}

// Function to retrieve messages from local storage
function getMessagesFromLocalStorage() {
  return JSON.parse(localStorage.getItem("messages")) || [];
}

// Function to display messages filtered by group ID
function displayMessagesByGroupId(groupId) {
  // Retrieve messages from local storage
  const storedMessages = getMessagesFromLocalStorage();

  // Filter messages based on group ID
  const groupMessages = storedMessages.filter(
    (message) => message.groupId === groupId
  );

  // Display filtered messages
  chatMessages.innerHTML = ""; // Clear previous messages
  groupMessages.forEach((message) => {
    displayMessage(message);
  });
}

// Function to create HTML elements for displaying a single message
function displayMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
      <div class="sender">~${message.sender}</div>
      <div class="message-content">${message.message}</div>
    `;
  chatMessages.appendChild(div);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // displayGroupNamesFromLocalStorage();
    const groups = await fetchGroupsForUser();
    console.log("fetched groups", groups);
    displayGroupNames(groups);

    // Check if there's a stored currentGroupId in localStorage
    const storedGroupId = JSON.parse(localStorage.getItem("currentGroupId"));
    console.log("storedGroupId", storedGroupId);
    if (storedGroupId) {
      // Set the currentGroupId from localStorage
      currentGroupId = storedGroupId;
      console.log("updatedCurrentGroupId:", currentGroupId);
      const savedGroupItem = document.querySelector(
        `#groupList li[data-group-id="${storedGroupId}"]`
      );
      console.log("savedGroupItem:::", savedGroupItem);
      if (savedGroupItem) {
        // Remove highlight from all group items
        document.querySelectorAll("#groupList li").forEach((groupItem) => {
          groupItem.classList.remove("highlighted");
        });
        // Add highlight to the saved group item
        savedGroupItem.classList.add("highlighted");
      }

      // Fetch and display messages for the current group
      const lastMessageId = getLastMessageIdForGroup(currentGroupId);
      const newMessages = await fetchNewMessages(currentGroupId, lastMessageId);
      updateLocalStorage(newMessages);

      displayMessagesByGroupId(currentGroupId);
    } else {
      // Handle the case when there's no stored currentGroupId
      console.log("No stored currentGroupId found.");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
});

// Event listener for sending messages
sendMessageButton.addEventListener("click", async (e) => {
  e.preventDefault();

  // Validate message input
  const message = messageInput.value.trim();
  if (!message) {
    console.error("Message cannot be empty");
    return;
  }

  try {
    // Send message to the backend
    const result = await storeMessageToBackend(currentGroupId, message);
    if (result.success) {
      console.log("Message sent successfully:", result.userMsg);
      messageInput.value = ""; // Clear message input after sending

      // Fetch and display new messages
      const lastMessageId = getLastMessageIdForGroup(currentGroupId);
      const newMessage = await fetchNewMessages(currentGroupId, lastMessageId);
      updateLocalStorage(newMessage);
      displayMessagesByGroupId(currentGroupId);
    } else {
      console.log("Failed to send message:", result.error);
    }
  } catch (error) {
    console.error("Error sending message:", error.message);
  }
});

// Function to send a message to the backend
async function storeMessageToBackend(groupId, message) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/message",
      { groupId, message },
      { headers: commonHeaders }
    );
    return response.data;
  } catch (error) {
    throw new Error("Error sending message: " + error.message);
  }
}

// Event listener for creating a new group
createGroupBtn.addEventListener("click", () => {
  createGroupSection.style.display = "block";
  fetchUsersForGroups();
});

// Function to save group name to local storage
function saveGroupNameToLocalStorage(groupName, groupId) {
  const savedGroupNames = JSON.parse(localStorage.getItem("groupNames")) || [];
  savedGroupNames.push({
    name: groupName,
    id: groupId,
  });
  localStorage.setItem("groupNames", JSON.stringify(savedGroupNames));
}

// Function to load group names from local storage
function loadGroupNamesFromLocalStorage() {
  const savedGroupNames = JSON.parse(localStorage.getItem("groupNames")) || [];
  return savedGroupNames;
}

// Function to display group names from local storage
function displayGroupNames(groupNames) {
  groupList.innerHTML = "";
  // const savedGroupNames = loadGroupNamesFromLocalStorage();

  groupNames.forEach((groupName) => {
    displayGroupName(groupName);
  });
}
function displayGroupName(groupName) {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = "#";
  a.textContent = groupName.name;
  li.dataset.groupId = groupName.id;
  li.appendChild(a);
  groupList.appendChild(li);

  // Event listener to handle click on group items
  li.addEventListener("click", async () => {
    // Remove highlight from all group items
    document.querySelectorAll("#groupList li").forEach((groupItem) => {
      groupItem.classList.remove("highlighted");
    });

    // Add highlight to the clicked group item
    li.classList.add("highlighted");

    // Set the current group ID
    currentGroupId = li.dataset.groupId;

    localStorage.setItem("currentGroupId", JSON.stringify(currentGroupId));

    console.log("currentGroupId:", currentGroupId);

    // Call function to fetch and display group messages
    const lastMessageId = getLastMessageIdForGroup(currentGroupId);
    const newMessages = await fetchNewMessages(currentGroupId, lastMessageId);
    updateLocalStorage(newMessages);
    displayMessagesByGroupId(currentGroupId);
    displayGroupMembers(currentGroupId);
  });
}

createGroup.addEventListener("click", async () => {
  const groupName = groupNameInput.value.trim();
  if (!groupName) {
    console.error("Group name cannot be empty");
    return;
  }

  // Gather selected users
  const selectedUsers = [];
  document
    .querySelectorAll('input[name="selectedUsers"]:checked')
    .forEach((checkbox) => {
      selectedUsers.push(checkbox.value);
    });
  console.log("Selected Users:", selectedUsers);
  if (selectedUsers.length === 0) {
    console.error("Please select at least one user to create a group");
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/createGroup",
      { groupName, selectedUsers },
      { headers: commonHeaders }
    );

    if (response.status === 201) {
      const newGroup = response.data.group;

      console.log("New group created:", newGroup);

      alert(`Group "${newGroup.name}" successfully created!`);

      // saveGroupNameToLocalStorage(newGroup.name, newGroup.id);
      displayGroupName(newGroup);

      createGroupSection.style.display = "none";

      groupNameInput.value = "";
    } else {
      console.error("Failed to create group:", response.data.message);

      alert("Failed to create group. Please try again.");
    }
  } catch (error) {
    console.error("Error creating group:", error.message);

    alert("Failed to create group. Please try again.");
  }
});

cancelCreateGroupBtn.addEventListener("click", () => {
  createGroupSection.style.display = "none";
});

async function fetchUsersForGroups() {
  try {
    const response = await axios.get("http://localhost:3000/api/users");
    if (response.status === 200) {
      console.log("Users fetched successfully");
      showUsers(response.data.users);
    }
  } catch (error) {
    console.error("Unable to fetch users:", error.message);
    alert("Failed to fetch users. Please try again.");
  }
}

function showUsers(users) {
  const selectUsersContainer = document.getElementById("selectUsers");
  // Clear previous content
  selectUsersContainer.innerHTML = "";

  console.log(users);
  users.forEach((user) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "selectedUsers";
    checkbox.value = user.id;

    const label = document.createElement("label");
    label.textContent = user.name;
    label.appendChild(checkbox);

    const listItem = document.createElement("div");
    listItem.appendChild(label);

    selectUsersContainer.appendChild(listItem);
  });
}

// Modal related code

// Function to fetch and display group members in a modal

async function displayGroupMembers(groupId) {
  try {
    // Fetch group members from the backend
    const response = await axios.get(
      `http://localhost:3000/api/groups/${groupId}/members`,
      {
        headers: commonHeaders,
      }
    );
    const groupMembers = response.data.members;

    const isCurrentUserAdmin = response.data.isCurrentUserAdmin;

    console.log("groupMembers--------->", groupMembers);
    console.log("isCurrentUserAdmin--------->", isCurrentUserAdmin);

    // Populate the modal with group members
    const groupMembersList = document.getElementById("groupMembersList");
    groupMembersList.innerHTML = ""; // Clear previous members

    groupMembers.forEach((member) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${member.name} ${
        member.isAdmin ? "( Admin )" : ""
      }`;

      // Add remove button if the member is not an admin and the current user is an admin
      if (!member.isAdmin && isCurrentUserAdmin) {
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", async () => {
          // Add logic to remove the member from the group
          try {
            // Make an Axios request to the backend to remove the user from the group
            const response = await axios.delete(
              `/api/admin/${groupId}/remove/${member.id}`
            );

            // Check if the removal was successful
            if (response.status === 200) {
              console.log(response.data.message);
              // Optionally, you can update the UI to reflect the removal, such as removing the user from the list
              listItem.remove();
            } else {
              console.error(
                "Failed to remove user from the group:",
                response.data.message
              );
            }
          } catch (error) {
            console.error("Error removing user from group:", error);
          }

          // console.log("Remove button clicked for member:", member.id);
        });
        listItem.appendChild(removeButton);
      }

      groupMembersList.appendChild(listItem);
    });

    // Add delete group button if the current user is an admin
    if (isCurrentUserAdmin) {
      const deleteGroupButton = document.createElement("button");
      deleteGroupButton.textContent = "Delete Group";
      deleteGroupButton.classList.add("delete-group-button");
      deleteGroupButton.addEventListener("click", async () => {
        // Add logic to delete the group
        try {
          const response = await axios.delete(`/api/admin/delete/${groupId}`);
          console.log(response.data.message);
          // Remove the group from UI and local storage
          const groupListItem = document.querySelector(
            `li[data-group-id="${groupId}"]`
          );
          if (groupListItem) {
            groupListItem.remove(); // Remove from UI
          }
          // Remove messages associated with the deleted group from local storage
          const storedMessages =
            JSON.parse(localStorage.getItem("messages")) || [];
          const updatedMessages = storedMessages.filter(
            (message) => parseInt(message.groupId) !== parseInt(groupId)
          );
          localStorage.setItem("messages", JSON.stringify(updatedMessages));
          displayMessagesByGroupId(groupId);

          // // Update group names in local storage
          // const savedGroupNames =
          //   JSON.parse(localStorage.getItem("groupNames")) || [];

          // const updatedGroupNames = savedGroupNames.filter((group) => {
          //   console.log("Comparison Result:", group.id !== groupId);
          //   return parseInt(group.id) !== parseInt(groupId);
          // });
          // console.log("Updated Group Names:", updatedGroupNames);
          // localStorage.setItem("groupNames", JSON.stringify(updatedGroupNames));

          closeModal(); // Close the modal
        } catch (error) {
          console.error("Error deleting group:", error);
          // Optionally, you can handle errors here, such as displaying an error message to the user
        }
        // This could involve making a request to your backend API
        // console.log("Delete group button clicked for group:", groupId);
      });
      groupMembersList.appendChild(deleteGroupButton);
    }
    // Display the modal
    const modal = document.getElementById("groupMembersModal");
    modal.style.display = "block";

    // Close the modal when the close button or outside the modal is clicked
    const closeModal = () => {
      modal.style.display = "none";
    };

    const closeBtn = document.querySelector(".modal-content .close");
    closeBtn.addEventListener("click", closeModal);

    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  } catch (error) {
    console.error("Error fetching group members:", error);
  }
}

function getLastMessageIdForGroup(groupId) {
  const storedMessages = JSON.parse(localStorage.getItem("messages")) || [];
  const groupMessages = storedMessages.filter(
    (message) => message.groupId === groupId
  );
  if (groupMessages.length > 0) {
    return groupMessages[groupMessages.length - 1].id; // Return the ID of the last message
  } else {
    return null; // Return null if there are no messages for the group
  }
}
