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
  // State to manage loading status
  const [loading, setLoading] = useState<boolean>(false);
  // State to manage user input
  const [input, setInput] = useState<string>("");
  // State to manage chat messages
  const [messages, setMessages] = useState<IOpenAIMessages[]>([]);
  // State to manage response from the model
  const [response, setResponse] = useState<IOpenAIStateWithIndex>({
    messages: [],
    index: uuid(),
  });
  // Reference to the scroll view
  const scrollViewRef = useRef<ScrollView | null>(null);

  // Function to generate a response from the model
  const generateResponse = useCallback(async () => {
    // Return early if there is no input
    if (!input) return;
    // Dismiss the keyboard
    Keyboard.dismiss();
    // Set loading state to true
    setLoading(true);

    // Prepare the message request payload
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

    // Update response state with the new user message
    const newMessages = [...response.messages, { user: input, assistant: "" }];
    setResponse({ index: response.index, messages: newMessages });

    // Prepare event source arguments
    const eventSourceArgs = {
      body: { messages: messagesRequest, model: chatType.label },
      type: getChatType(chatType),
    };

    // Get the event source
    const eventSource = getEventSource(eventSourceArgs);

    // Event listener for open event
    eventSource.addEventListener("open", () => {
      setLoading(false);
    });

    // Event listener for message event
    eventSource.addEventListener("message", (event) => {
      if (event.data !== "[DONE]") {
        // Check if event.data is not null
        if (event.data) {
          const localResponse =
            newMessages[newMessages.length - 1].assistant +
            JSON.parse(event.data).content;
          newMessages[newMessages.length - 1].assistant = localResponse;
          setResponse({ index: response.index, messages: [...newMessages] });
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      } else {
        setLoading(false);
        eventSource.close();
      }
    });

    // Event listener for error event
    eventSource.addEventListener("error", (error) => {
      console.error("Connection error:", error);
      setLoading(false);
      eventSource.close();
    });

    // Clear the input field
    setInput("");
  }, [input, messages, response, chatType]);

  // Return the state and functions needed by the Chat component
  return {
    loading,
    input,
    messages: response.messages,
    setInput,
    generateResponse,
    setMessages,
    scrollViewRef,
  };
};

export default useGPT;
