import { DOMAIN } from '../constants';
import EventSource from 'react-native-sse';
import { Model } from '../types';

// Function to create an EventSource instance for server-sent events
export function getEventSource({ headers, body, type }: { headers?: any, body: any, type: string }) {
  const es = new EventSource(`${DOMAIN}/chat/${type}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    method: 'POST',
    body: JSON.stringify(body),
  });
  return es;
}

// Function to truncate a string to a specified number of characters or less. For better control over the length of the text displayed implementing a character limit.
export function getFirstNCharsOrLess(text: string, numChars: number = 1000) {
  return text.length <= numChars ? text : text.substring(0, numChars);
}

// Function to get the first N messages from an array of messages. For better control over the number of messages displayed
export function getFirstN({ messages, size = 10 }: { size?: number, messages: any[] }) {
  return messages.length > size ? messages.slice(0, size) : messages;
}

// Function to determine the chat type based on the model label
export function getChatType(type: Model) {
  if (type.label.includes('gpt')) {
    return 'gpt';
  } else if (type.label.includes('cohere')) {
    return 'cohere';
  } else if (type.label.includes('mistral')) {
    return 'mistral';
  } else if (type.label.includes('gemini')) {
    return 'gemini';
  } else {
    return 'claude';
  }
}