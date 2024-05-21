import { createContext } from "react";
import { IThemeContext, IAppContext } from "../types";
import { MODELS } from "../constants";
import { IMAGE_MODELS } from "../constants";

// Theme context to manage theme state across the app
const ThemeContext = createContext<IThemeContext>({
  // Default theme object
  theme: {},
  // Placeholder function for setting theme
  setTheme: () => null,
  // Default theme name
  themeName: "",
});


// App context to manage application-wide state
const AppContext = createContext<IAppContext>({
  // Default chat type set to GPT Turbo model
  chatType: MODELS.gptTurbo,
  // Default image model set to fastImage
  imageModel: IMAGE_MODELS.fastImage.label,
  // Placeholder function for setting chat type
  setChatType: () => null,
  // Placeholder function for handling modal press
  handlePresentModalPress: () => null,
  // Placeholder function for setting image model
  setImageModel: () => null,
  // Placeholder function for closing modal
  closeModal: () => null,
});

export { ThemeContext, AppContext };
