const commonHeaders = {
  Authorization: localStorage.getItem("token"),
};

const sendMessageButton = document.querySelector("#sendMessage");
const messageInput = document.querySelector("#msg");

sendMessageButton.addEventListener("click", messageHandler);

async function messageHandler(e) {
  e.preventDefault();

    const message = messageInput.value;
    console.log("input message",message)

  try {
    const result = await storeMessageToBackend(message);
    if (result.success) {
      console.log("Message sent successfully:", result.userMsg);
      // Do something with the successful response
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
