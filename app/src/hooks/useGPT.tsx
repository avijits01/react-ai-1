import { useState, useRef, useCallback } from "react";
import { Keyboard, ScrollView } from "react-native";
import { v4 as uuid } from "uuid";
import {
  getEventSource,
  getFirstN,
  getFirstNCharsOrLess,
  getChatType,
} from "../utils";
import { IOpenAIMessages, IOpenAIStateWithIndex } from "../../types";

const useGPT = (chatType) => {
  // To manage the loading state for UI feedback
  const [loading, setLoading] = useState<boolean>(false);
  
  // To manage the user input in the chat
  const [input, setInput] = useState<string>("");
  
  // To store the chat messages
  const [messages, setMessages] = useState<IOpenAIMessages[]>([]);
  
  // To store the response from the model and uniquely identify the session
  const [response, setResponse] = useState<IOpenAIStateWithIndex>({
    messages: [],
    index: uuid(),
  });
  
  // To maintain a reference to the ScrollView for scrolling to the end on new messages
  const scrollViewRef = useRef<ScrollView | null>(null);
  
  // To manage any errors during the message generation process
  const [error, setError] = useState<string | null>(null);

  // Function to generate a response from the model
  const generateResponse = useCallback(async () => {
    // To prevent generating a response if there's no user input
    if (!input) return;
    Keyboard.dismiss();
    setLoading(true);
    setError(null);

    // Prepare the message request payload to limit the number of messages sent for client-side rate limiting
    let messagesRequest = getFirstN({ messages });
    if (response.messages.length) {
      messagesRequest = [
        ...messagesRequest,
        {
          role: "assistant",
          content: getFirstNCharsOrLess(
            response.messages[response.messages.length - 1].assistant
          ),
        },
      ];
    }
    messagesRequest = [...messagesRequest, { role: "user", content: input }];
    setMessages(messagesRequest);

    // Update response state with the new user message to maintain the chat session state
    const newMessages = [...response.messages, { user: input, assistant: "" }];
    setResponse({ index: response.index, messages: newMessages });

    // Prepare event source arguments to set up the server-sent events connection
    const eventSourceArgs = {
      body: { messages: messagesRequest, model: chatType.label },
      type: getChatType(chatType),
    };

    // Get the event source to stream responses from the server
    const eventSource = getEventSource(eventSourceArgs);

    // Event listener for open event to update the loading state
    eventSource.addEventListener("open", () => {
      setLoading(false);
    });

    // Event listener for message event to handle incoming data from the server
    eventSource.addEventListener("message", (event) => {
      if (event.data !== "[DONE]") {
        // To ensure the event data is not null and process it
        if (event.data) {
          const data = JSON.parse(event.data);
          if (data.error) {
            setError(data.error);
            setLoading(false);
            eventSource.close();
          } else {
            console.log("data", data);
            const localResponse =
              newMessages[newMessages.length - 1].assistant + data.content;
            newMessages[newMessages.length - 1].assistant = localResponse;
            setResponse({ index: response.index, messages: [...newMessages] });
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }
        }
      } else {
        setLoading(false);
        eventSource.close();
      }
    });

    // Event listener for error event to handle connection errors
    eventSource.addEventListener("error", (error) => {
      console.error("Connection error:", error);
      setLoading(false);
      eventSource.close();
    });

    // Clear the input field to reset the chat input box
    setInput("");
  }, [input, messages, response, chatType]); // dependencies to avoid recreating the function unnecessarily

  // Return the state and functions needed by the Chat component
  return {
    loading,
    input,
    messages: response.messages,
    setInput, // toDo: useCallback to memorise setter function
    generateResponse,
    setResponse, // toDo: useCallback to memorise setter function
    scrollViewRef,
    error,
  };
};

export default useGPT;
