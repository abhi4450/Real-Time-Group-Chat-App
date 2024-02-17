const commonHeaders = {
  Authorization: localStorage.getItem("token"),
};

const sendMessageButton = document.querySelector("#sendMessage");
const messageInput = document.querySelector("#msg");
const chatMessages = document.getElementById("chatMessages");

// Function to fetch new messages from the backend based on last message ID
async function fetchNewMessages(lastMessageId) {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/getmessages?lastMessageId=${lastMessageId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching new messages:", error);
    throw new Error("Failed to fetch new messages");
  }
}

// Function to update local storage with new messages
function updateLocalStorage(messages) {
  try {
    const storedMessages = JSON.parse(localStorage.getItem("messages")) || [];
    const updatedMessages = [...storedMessages, ...messages];
    if (updatedMessages.length > 10) {
      updatedMessages.splice(0, updatedMessages.length - 10); // Keep only the recent 10 messages
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

// Function to display messages
function displayMessages(messages) {
  chatMessages.innerHTML = ""; // Clear previous messages
  messages.forEach((message) => {
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

// Initial fetch of messages on DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch messages from local storage
    const storedMessages = getMessagesFromLocalStorage();
    displayMessages(storedMessages);
    const lastMessageId =
      storedMessages.length > 0
        ? storedMessages[storedMessages.length - 1].id
        : undefined;
    const newMessages = await fetchNewMessages(lastMessageId);
    if (newMessages.length === 0) return;
    updateLocalStorage(newMessages);
    displayMessages(newMessages);
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
    const result = await storeMessageToBackend(message);
    if (result.success) {
      console.log("Message sent successfully:", result.userMsg);
      messageInput.value = ""; // Clear message input after sending

      // Fetch and display new messages
      const storedMessages = getMessagesFromLocalStorage();
      const lastMessageId =
        storedMessages.length > 0
          ? storedMessages[storedMessages.length - 1].id
          : undefined;
      const newMessage = await fetchNewMessages(lastMessageId);
      updateLocalStorage(newMessage);
      displayMessage(newMessage[0]);
    } else {
      console.log("Failed to send message:", result.error);
    }
  } catch (error) {
    console.error("Error sending message:", error.message);
  }
});

// Function to send a message to the backend
async function storeMessageToBackend(message) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/message",
      { message },
      { headers: commonHeaders }
    );
    return response.data;
  } catch (error) {
    throw new Error("Error sending message: " + error.message);
  }
}
