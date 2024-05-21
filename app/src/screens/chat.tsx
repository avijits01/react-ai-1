import {
  View,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableHighlight,
  TextInput,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Keyboard,
} from "react-native";
import "react-native-get-random-values";
import { useContext, useEffect, useCallback, useMemo } from "react";
import { ThemeContext, AppContext } from "../context" ;
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useActionSheet } from "@expo/react-native-action-sheet";
import Markdown from "@ronradtke/react-native-markdown-display";
import useGPT from "../hooks/useGPT";

// Map chat types to their corresponding hooks
const modelHooks = {
  gpt: useGPT
  // Add other models here
};


export function Chat() {
  // Use action sheet from expo
  const { showActionSheetWithOptions } = useActionSheet();
  // Get the current theme context
  const { theme } = useContext(ThemeContext);
  // Get the current chat type context
  const { chatType } = useContext(AppContext);

  // Get styles based on the theme
  // useMemo to memoize styles based on theme to avoid recalculating styles on every render
  const styles = useMemo(() => getStyles(theme), [theme]);


  // Get the appropriate hook based on chatType
  // useMemo to memoize the model hook based on chatType to avoid recalculating the hook on every render
  const useModelHook = useMemo(() => modelHooks[chatType.label] || useGPT, [chatType]);

  // Destructure values from the hook
  const {
    loading,
    input,
    messages,
    setInput,
    generateResponse,
    setResponse,
    scrollViewRef,
    error,
  } = useModelHook(chatType);

  // Handle sending a chat message
  // useCallback to prevent re-creation of the function unless input or generateResponse changes
  const chat = useCallback(async () => {
    if (!input) return; // Prevent sending empty messages
    Keyboard.dismiss(); // Dismiss the keyboard
    console.log("Creating chat message");
    generateResponse(); // Generate response from the model
  }, [input, generateResponse]);


  // Copy text to clipboard
  // useCallback ensures the function is only declared once
  const copyToClipboard = useCallback(async (text) => {
    await Clipboard.setStringAsync(text);
  }, []);



  // Clear chat messages
  // useCallback to prevent re-creation of the function unless loading changes
  const clearChat = useCallback(async () => {
    if (loading) return; // Prevent clearing if loading
    setInput(""); // Reset input state
    setResponse({ messages: [] }); // Clear response messages
  }, [loading]);


  // Show action sheet for clipboard actions
  // can be refactored: ChatMessages component for rendering chat messages
  const showClipboardActionsheet = useCallback(async (text) => {
    const cancelButtonIndex = 2;
    showActionSheetWithOptions(
      {
        options: ["Copy to clipboard", "Clear chat", "Cancel"],
        cancelButtonIndex,
      },
      (selectedIndex) => {
        if (selectedIndex === 0) {
          copyToClipboard(text);
        }
        if (selectedIndex === 1) {
          clearChat();
        }
      }
    );
  }, [copyToClipboard, showActionSheetWithOptions, clearChat]);

  // Render chat messages
  // can be refactored: ChatMessages component for rendering chat messages
  const renderItem = useCallback(({ item, index }) => (
    <View style={styles.promptResponse} key={index}>
      <View style={styles.promptTextContainer}>
        <View style={styles.promptTextWrapper}>
          <Text style={styles.promptText}>{item.user}</Text>
        </View>
      </View>
      {item.assistant && (
        <View style={styles.textStyleContainer}>
          <Markdown style={styles.markdownStyle as any}>
            {item.assistant}
          </Markdown>
          <TouchableHighlight
            onPress={() => showClipboardActionsheet(item.assistant)}
            underlayColor={"transparent"}
          >
            <View style={styles.optionsIconWrapper}>
              <Ionicons name="apps" size={20} color={theme.textColor} />
            </View>
          </TouchableHighlight>
        </View>
      )}
    </View>
  ), [styles, showClipboardActionsheet, theme.textColor]);


  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={styles.container}
      keyboardVerticalOffset={110}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        ref={scrollViewRef}
        contentContainerStyle={
          !messages.length && styles.scrollContentContainer
        }
      >
        {!messages.length && (
          <View style={styles.midChatInputWrapper}>
            <View style={styles.midChatInputContainer}>
              <TextInput
                onChangeText={setInput}
                style={styles.midInput}
                placeholder="Message"
                placeholderTextColor={theme.placeholderTextColor}
                autoCorrect={true}
                value={input}
              />
              <TouchableHighlight
                onPress={chat}
                underlayColor={"transparent"}
              >
                <View style={styles.midButtonStyle}>
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={22}
                    color={theme.tintTextColor}
                  />
                  <Text style={styles.midButtonText}>
                    Start {chatType.name} Chat
                  </Text>
                </View>
              </TouchableHighlight>
              <Text style={styles.chatDescription}>
                Chat with a variety of different language models.
              </Text>
              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
            </View>
          </View>
        )}
        {messages.length > 0 && (
          <FlatList
            data={messages}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        )}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        {loading && <ActivityIndicator style={styles.loadingContainer} />}
      </ScrollView>
      {messages.length > 0 && (
        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={setInput}
            placeholder="Message"
            placeholderTextColor={theme.placeholderTextColor}
            value={input}
          />
          <TouchableHighlight
            underlayColor={"transparent"}
            activeOpacity={0.65}
            onPress={chat}
          >
            <View style={styles.chatButton}>
              <Ionicons
                name="md-arrow-up"
                size={20}
                color={theme.tintTextColor}
              />
            </View>
          </TouchableHighlight>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// Function to get styles based on the current theme
const getStyles = (theme: any) =>
  StyleSheet.create({
    optionsIconWrapper: {
      padding: 10,
      paddingTop: 9,
      alignItems: "flex-end",
    },
    scrollContentContainer: {
      flex: 1,
    },
    chatDescription: {
      color: theme.textColor,
      textAlign: "center",
      marginTop: 15,
      fontSize: 13,
      paddingHorizontal: 34,
      opacity: 0.8,
      fontFamily: theme.regularFont,
    },
    midInput: {
      marginBottom: 8,
      borderWidth: 1,
      paddingHorizontal: 25,
      marginHorizontal: 10,
      paddingVertical: 15,
      borderRadius: 99,
      color: theme.textColor,
      borderColor: theme.borderColor,
      fontFamily: theme.mediumFont,
    },
    midButtonStyle: {
      flexDirection: "row",
      marginHorizontal: 14,
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 99,
      backgroundColor: theme.tintColor,
      justifyContent: "center",
      alignItems: "center",
    },
    midButtonText: {
      color: theme.tintTextColor,
      marginLeft: 10,
      fontFamily: theme.boldFont,
      fontSize: 16,
    },
    midChatInputWrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    midChatInputContainer: {
      width: "100%",
      paddingTop: 5,
      paddingBottom: 5,
    },
    loadingContainer: {
      marginTop: 25,
    },
    promptResponse: {
      marginTop: 10,
    },
    textStyleContainer: {
      borderWidth: 1,
      marginRight: 25,
      borderColor: theme.borderColor,
      padding: 15,
      paddingBottom: 6,
      paddingTop: 5,
      margin: 10,
      borderRadius: 13,
    },
    promptTextContainer: {
      flex: 1,
      alignItems: "flex-end",
      marginRight: 15,
      marginLeft: 24,
    },
    promptTextWrapper: {
      borderRadius: 8,
      borderTopRightRadius: 0,
      backgroundColor: theme.tintColor,
    },
    promptText: {
      color: theme.tintTextColor,
      fontFamily: theme.regularFont,
      paddingVertical: 5,
      paddingHorizontal: 9,
      fontSize: 16,
    },
    chatButton: {
      marginRight: 14,
      padding: 5,
      borderRadius: 99,
      backgroundColor: theme.tintColor,
    },
    chatInputContainer: {
      paddingTop: 5,
      borderColor: theme.borderColor,
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 5,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 99,
      color: theme.textColor,
      marginHorizontal: 10,
      paddingVertical: 10,
      paddingHorizontal: 21,
      paddingRight: 39,
      borderColor: theme.borderColor,
      fontFamily: theme.semiBoldFont,
    },
    container: {
      backgroundColor: theme.backgroundColor,
      flex: 1,
    },
    markdownStyle: {
      body: {
        color: theme.textColor,
        fontFamily: theme.regularFont,
      },
      paragraph: {
        color: theme.textColor,
        fontSize: 16,
        fontFamily: theme.regularFont,
      },
      heading1: {
        color: theme.textColor,
        fontFamily: theme.semiBoldFont,
        marginVertical: 5,
      },
      heading2: {
        marginTop: 20,
        color: theme.textColor,
        fontFamily: theme.semiBoldFont,
        marginBottom: 5,
      },
      heading3: {
        marginTop: 20,
        color: theme.textColor,
        fontFamily: theme.mediumFont,
        marginBottom: 5,
      },
      heading4: {
        marginTop: 10,
        color: theme.textColor,
        fontFamily: theme.mediumFont,
        marginBottom: 5,
      },
      heading5: {
        marginTop: 10,
        color: theme.textColor,
        fontFamily: theme.mediumFont,
        marginBottom: 5,
      },
      heading6: {
        color: theme.textColor,
        fontFamily: theme.mediumFont,
        marginVertical: 5,
      },
      list_item: {
        marginTop: 7,
        color: theme.textColor,
        fontFamily: theme.regularFont,
        fontSize: 16,
      },
      ordered_list_icon: {
        color: theme.textColor,
        fontSize: 16,
        fontFamily: theme.regularFont,
      },
      bullet_list: {
        marginTop: 10,
      },
      ordered_list: {
        marginTop: 7,
      },
      bullet_list_icon: {
        color: theme.textColor,
        fontSize: 16,
        fontFamily: theme.regularFont,
      },
      code_inline: {
        color: theme.secondaryTextColor,
        backgroundColor: theme.secondaryBackgroundColor,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, .1)",
        fontFamily: theme.lightFont,
      },
      hr: {
        backgroundColor: "rgba(255, 255, 255, .1)",
        height: 1,
      },
      fence: {
        marginVertical: 5,
        padding: 10,
        color: theme.secondaryTextColor,
        backgroundColor: theme.secondaryBackgroundColor,
        borderColor: "rgba(255, 255, 255, .1)",
        fontFamily: theme.regularFont,
      },
      tr: {
        borderBottomWidth: 1,
        borderColor: "rgba(255, 255, 255, .2)",
        flexDirection: "row",
      },
      table: {
        marginTop: 7,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, .2)",
        borderRadius: 3,
      },
      blockquote: {
        backgroundColor: "#312e2e",
        borderColor: "#CCC",
        borderLeftWidth: 4,
        marginLeft: 5,
        paddingHorizontal: 5,
        marginVertical: 5,
      },
    } as any,
    errorText: {
      color: 'red',
      textAlign: 'center',
      marginTop: 10,
      fontSize: 14,
      paddingHorizontal: 20,
    },
  });
