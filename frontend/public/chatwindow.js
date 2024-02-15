const commonHeaders = {
  Authorization: localStorage.getItem("token"),
};

const sendMessageButton = document.querySelector("#sendMessage");
const messageInput = document.querySelector("#msg");
const chatMessages = document.getElementById("chatMessages"); // Retrieve chatMessages element once

sendMessageButton.addEventListener("click", messageHandler);

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch initial messages from the server when the page loads
    const response = await axios.get("http://localhost:3000/api/getmessages");
    const messages = response.data;
    displayMessages(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
});

async function messageHandler(e) {
  e.preventDefault();

  const message = messageInput.value;
  console.log("Input message:", message);

  try {
    const result = await storeMessageToBackend(message);
    if (result.success) {
      console.log("Message sent successfully:", result.userMsg);
      // Do something with the successful response
      displayMessage(result.userMsg); // Display the newly sent message
    } else {
      console.log("Failed to send message:", result.error);
      // Handle the failure case
    }
  } catch (error) {
    console.log("Error sending message:", error);
  }
}

async function storeMessageToBackend(message) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/message",
      { message },
      {
        headers: commonHeaders,
      }
    );

    return response.data; // Return the response data
  } catch (error) {
    throw new Error("Error sending message: " + error.message);
  }
}

function displayMessages(messages) {
  messages.forEach((message) => {
    displayMessage(message);
  });
}

function displayMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
      <div class="sender">${message.sender}</div>
      <div class="message-content">${message.message}</div>
    `;
  chatMessages.appendChild(div);
}
