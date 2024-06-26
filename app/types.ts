import { SetStateAction, Dispatch } from "react";

export interface IThemeContext {
  theme: any;
  setTheme: Dispatch<SetStateAction<string>>;
  themeName: string;
}

export interface Model {
  name: string;
  label: string;
  icon: any;
}

export interface IAppContext {
  chatType: Model;
  setChatType: Dispatch<SetStateAction<Model>>;
  handlePresentModalPress: () => void;
  setImageModel: Dispatch<SetStateAction<string>>;
  imageModel: string;
  closeModal: () => void;
}

export interface IIconProps {
  type: string;
  props: any;
}

export interface IOpenAIMessages {
  role: string;
  content: string;
}

export interface IOpenAIUserHistory {
  user: string;
  assistant: string;
  fileIds?: any[];
}

export interface IOpenAIStateWithIndex {
  index: string;
  messages: IOpenAIUserHistory[];
}

// Define a type for messages
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Define a type for the state
export interface ChatState {
  messages: ChatMessage[];
  index: string;
  modelType: string;
}
