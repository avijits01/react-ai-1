import "react-native-gesture-handler";
import { useState, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Main } from "./src/main";
import { useFonts } from "expo-font";
import { ThemeContext, AppContext } from "./src/context";
import * as themes from "./src/theme";
import { IMAGE_MODELS, MODELS } from "./constants";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ChatModelModal } from "./src/components/index";
import { Model } from "./types";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import LogBox from "react-native/Libraries/LogBox/LogBox";

// @ts-ignore
// Specific logbox warnings to ignore
LogBox.ignoreLogs([
  'Key "cancelled" in the image picker result is deprecated and will be removed in SDK 48, use "canceled" instead',
  "No native splash screen registered",
]);

export default function App() {
  // State for theme management
  const [theme, setTheme] = useState<string>("light");
  // State for chat type management
  const [chatType, setChatType] = useState<Model>(MODELS.gptTurbo);
  // State for image model management
  const [imageModel, setImageModel] = useState<string>(
    IMAGE_MODELS.fastImage.label
  );
  // State for modal visibility
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    "Geist-Regular": require("./assets/fonts/Geist-Regular.otf"),
    "Geist-Light": require("./assets/fonts/Geist-Light.otf"),
    "Geist-Bold": require("./assets/fonts/Geist-Bold.otf"),
    "Geist-Medium": require("./assets/fonts/Geist-Medium.otf"),
    "Geist-Black": require("./assets/fonts/Geist-Black.otf"),
    "Geist-SemiBold": require("./assets/fonts/Geist-SemiBold.otf"),
    "Geist-Thin": require("./assets/fonts/Geist-Thin.otf"),
    "Geist-UltraLight": require("./assets/fonts/Geist-UltraLight.otf"),
    "Geist-UltraBlack": require("./assets/fonts/Geist-UltraBlack.otf"),
  });

  // Configure persistent storage on component mount
  useEffect(() => {
    configureStorage();
  }, []);

  // Fetch and set stored preferences (theme, chatType, imageModel) from AsyncStorage
  async function configureStorage() {
    try {
      const _theme = await AsyncStorage.getItem("rnai-theme");
      if (_theme) setTheme(_theme);
      const _chatType = await AsyncStorage.getItem("rnai-chatType");
      if (_chatType) setChatType(JSON.parse(_chatType));
      const _imageModel = await AsyncStorage.getItem("rnai-imageModel");
      if (_imageModel) setImageModel(_imageModel);
    } catch (err) {
      console.log("error configuring storage", err);
    }
  }

  // Reference to the bottom sheet modal
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Close the bottom sheet modal
  // todo : use useCallback to memoize the function to prevent re-creation on every render
  function closeModal() {
    bottomSheetModalRef.current?.dismiss();
    setModalVisible(false);
  }

  // Toggle the bottom sheet modal visibility
  // todo : use useCallback to memoize the function to prevent re-creation on every render. On an empty dependency array, the function will be created only once.
  function handlePresentModalPress() {
    if (modalVisible) {
      closeModal();
    } else {
      bottomSheetModalRef.current?.present();
      setModalVisible(true);
    }
  }

  // Set the chat type and persist to AsyncStorage
  // todo : use useCallback to memoize the function to prevent re-creation on every render
  function _setChatType(type) {
    setChatType(type);
    AsyncStorage.setItem("rnai-chatType", JSON.stringify(type));
  }

  // Set the image model and persist to AsyncStorage
  function _setImageModel(model) {
    setImageModel(model);
    AsyncStorage.setItem("rnai-imageModel", model);
  }

  // Set the theme and persist to AsyncStorage
  function _setTheme(theme) {
    setTheme(theme);
    AsyncStorage.setItem("rnai-theme", theme);
  }

  // Get styles for the bottom sheet modal
  const bottomSheetStyles = getBottomsheetStyles(theme);

  // Render the app when fonts are loaded
  if (!fontsLoaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppContext.Provider
        value={{
          chatType,
          setChatType: _setChatType,
          handlePresentModalPress,
          imageModel,
          setImageModel: _setImageModel,
          closeModal,
        }}
      >
        <ThemeContext.Provider
          value={{
            theme: getTheme(theme),
            themeName: theme,
            setTheme: _setTheme,
          }}
        >
          <ActionSheetProvider>
            <NavigationContainer>
              <Main />
            </NavigationContainer>
          </ActionSheetProvider>
          <BottomSheetModalProvider>
            <BottomSheetModal
              handleIndicatorStyle={bottomSheetStyles.handleIndicator}
              handleStyle={bottomSheetStyles.handle}
              backgroundStyle={bottomSheetStyles.background}
              ref={bottomSheetModalRef}
              enableDynamicSizing={true}
              backdropComponent={(props) => (
                <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />
              )}
              enableDismissOnClose
              enablePanDownToClose
              onDismiss={() => setModalVisible(false)}
            >
              <BottomSheetView>
                <ChatModelModal
                  handlePresentModalPress={handlePresentModalPress}
                />
              </BottomSheetView>
            </BottomSheetModal>
          </BottomSheetModalProvider>
        </ThemeContext.Provider>
      </AppContext.Provider>
    </GestureHandlerRootView>
  );
}

// Function to get bottom sheet styles based on the current theme
const getBottomsheetStyles = (theme) =>
  StyleSheet.create({
    background: {
      paddingHorizontal: 24,
      backgroundColor: theme.backgroundColor,
    },
    handle: {
      marginHorizontal: 15,
      backgroundColor: theme.backgroundColor,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    handleIndicator: {
      backgroundColor: "rgba(255, 255, 255, .3)",
    },
  });

// Function to get the current theme object
function getTheme(theme: any) {
  let current;
  Object.keys(themes).forEach((_theme) => {
    if (_theme.includes(theme)) {
      current = themes[_theme];
    }
  });
  return current;
}
