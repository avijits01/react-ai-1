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
} from 'react-native';
import 'react-native-get-random-values';
import { useContext, useState, useRef } from 'react';
import { ThemeContext, AppContext } from '../context';
import {
  getEventSource,
  getFirstN,
  getFirstNCharsOrLess,
  getChatType,
} from '../utils';
import { v4 as uuid } from 'uuid';
import Ionicons from '@expo/vector-icons/Ionicons';
import { IOpenAIMessages, IOpenAIStateWithIndex } from '../../types';
import * as Clipboard from 'expo-clipboard';
import { useActionSheet } from '@expo/react-native-action-sheet';
import Markdown from '@ronradtke/react-native-markdown-display';

export function Chat() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const scrollViewReference = useRef<ScrollView | null>(null);
  const { showActionSheetWithOptions } = useActionSheet();

  // OpenAI state management
  const [openAIMessages, setOpenAIMessages] = useState<IOpenAIMessages[]>([]);
  const [openAIResponse, setOpenAIResponse] = useState<IOpenAIStateWithIndex>({
    messages: [],
    index: uuid(),
  });

  const { theme } = useContext(ThemeContext);
  const { chatType } = useContext(AppContext);
  const styles = getStyles(theme);

  // Function to handle user input and generate OpenAI response
  async function handleChat() {
    if (!userInput) return;
    Keyboard.dismiss();
    generateOpenAIResponse();
  }

  // Function to generate OpenAI response
  async function generateOpenAIResponse() {
    try {
      setIsLoading(true);
      // Set message state for OpenAI to have context on previous conversations
      let messagesRequest = getFirstN({ messages: openAIMessages });
      if (openAIResponse.messages.length) {
        messagesRequest = [
          ...messagesRequest,
          {
            role: 'assistant',
            content: getFirstNCharsOrLess(
              openAIResponse.messages[openAIResponse.messages.length - 1]
                .assistant
            ),
          },
        ];
      }
      messagesRequest = [...messagesRequest, { role: 'user', content: userInput }];
      setOpenAIMessages(messagesRequest);

      // Set local OpenAI state to display user's most recent question
      let openAIArray = [
        ...openAIResponse.messages,
        {
          user: userInput,
          assistant: '',
        },
      ];
      setOpenAIResponse((prevState) => ({
        index: prevState.index,
        messages: JSON.parse(JSON.stringify(openAIArray)),
      }));

      let localResponse = '';
      const eventSourceArgs = {
        body: {
          messages: messagesRequest,
          model: chatType.label,
        },
        type: getChatType(chatType),
      };
      setUserInput('');
      const eventSource = getEventSource(eventSourceArgs);

      // Event listener for server-sent events
      const listener = (event: any) => {
        if (event.type === 'open') {
          setIsLoading(false);
        } else if (event.type === 'message') {
          if (event.data !== '[DONE]') {
            if (localResponse.length < 850) {
              scrollViewReference.current?.scrollToEnd({
                animated: true,
              });
            }
            localResponse = localResponse + JSON.parse(event.data).content;
            openAIArray[openAIArray.length - 1].assistant = localResponse;
            setOpenAIResponse((prevState) => ({
              index: prevState.index,
              messages: JSON.parse(JSON.stringify(openAIArray)),
            }));
          } else {
            setIsLoading(false);
            eventSource.close();
          }
        } else if (event.type === 'error' || event.type === 'exception') {
          console.error('Connection error:', event.message);
          setIsLoading(false);
          eventSource.close();
        }
      };
      eventSource.addEventListener('open', listener);
      eventSource.addEventListener('message', listener);
      eventSource.addEventListener('error', listener);
    } catch (err) {
      console.log('Error in generateOpenAIResponse: ', err);
    }
  }

  // Function to copy text to clipboard
  async function copyToClipboard(text: string) {
    await Clipboard.setStringAsync(text);
  }

  // Function to show clipboard action sheet
  async function showClipboardActionSheet(text: string) {
    const cancelButtonIndex = 2;
    showActionSheetWithOptions(
      {
        options: ['Copy to clipboard', 'Clear chat', 'Cancel'],
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
  }

  // Function to clear the chat
  async function clearChat() {
    if (isLoading) return;
    setOpenAIResponse({ messages: [], index: uuid() });
    setOpenAIMessages([]);
  }

  // Function to render each item in the chat list
  function renderChatItem({ item, index }: { item: any; index: number }) {
    return (
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
              onPress={() => showClipboardActionSheet(item.assistant)}
              underlayColor={'transparent'}
            >
              <View style={styles.optionsIconWrapper}>
                <Ionicons
                  name="apps"
                  size={20}
                  color={theme.textColor}
                />
              </View>
            </TouchableHighlight>
          </View>
        )}
      </View>
    );
  }

  // Check if a call has been made to any chat type
  const isChatCalled = openAIResponse.messages.length > 0;

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={styles.container}
      keyboardVerticalOffset={110}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        ref={scrollViewReference}
        contentContainerStyle={!isChatCalled && styles.scrollContentContainer}
      >
        {!isChatCalled && (
          <View style={styles.midChatInputWrapper}>
            <View style={styles.midChatInputContainer}>
              <TextInput
                onChangeText={(text) => setUserInput(text)}
                style={styles.midInput}
                placeholder="Message"
                placeholderTextColor={theme.placeholderTextColor}
                autoCorrect={true}
              />
              <TouchableHighlight
                onPress={handleChat}
                underlayColor={'transparent'}
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
            </View>
          </View>
        )}
        {isChatCalled && (
          <FlatList
            data={openAIResponse.messages}
            renderItem={renderChatItem}
            scrollEnabled={false}
          />
        )}
        {isLoading && <ActivityIndicator style={styles.loadingContainer} />}
      </ScrollView>
      {isChatCalled && (
        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setUserInput(text)}
            placeholder="Message"
            placeholderTextColor={theme.placeholderTextColor}
            value={userInput}
          />
          <TouchableHighlight
            underlayColor={'transparent'}
            activeOpacity={0.65}
            onPress={handleChat}
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

const getStyles = (theme: any) =>
  StyleSheet.create({
    // ... (styles remain the same)
  } as any);