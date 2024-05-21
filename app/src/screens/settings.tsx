import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { useContext, useMemo, useCallback } from "react";
import { AppContext, ThemeContext } from "../context";
import {
  AnthropicIcon,
  OpenAIIcon,
  CohereIcon,
  MistralIcon,
  GeminiIcon,
} from "../components/index";
import FontAwesome from "@expo/vector-icons/FontAwesome5";
import { IIconProps } from "../../types";
import { MODELS, IMAGE_MODELS } from "../../constants";
import * as themes from "../theme";

const { width } = Dimensions.get("window");
const models = Object.values(MODELS);
const imageModels = Object.values(IMAGE_MODELS);
const _themes = Object.values(themes).map((v) => ({
  name: v.name,
  label: v.label,
}));

export function Settings() {
  // Get theme context
  const { theme, setTheme, themeName } = useContext(ThemeContext);
  // Get chat type and image model context
  const { chatType, setChatType, setImageModel, imageModel } =
    useContext(AppContext);

  // Get styles based on the theme
  // useMemo to memoize styles based on theme to avoid recalculating styles on every render
  const styles = useMemo(() => getStyles(theme), [theme]);
 

  // Function to render icons based on the type
  // useCallback to memoize the function to prevent re-creation on every render
  const renderIcon = useCallback(({ type, props }: IIconProps) => {
    if (type.includes("gpt")) {
      return <OpenAIIcon {...props} />;
    }
    if (type.includes("claude")) {
      return <AnthropicIcon {...props} />;
    }
    if (type.includes("cohere")) {
      return <CohereIcon {...props} />;
    }
    if (type.includes("mistral")) {
      return <MistralIcon {...props} />;
    }
    if (type.includes("gemini")) {
      return <GeminiIcon {...props} />;
    }
    if (type.includes("fastImage")) {
      return <FontAwesome name="images" {...props} />;
    }
    if (type.includes("removeBg")) {
      return <FontAwesome name="eraser" {...props} />;
    }
    if (type.includes("upscale")) {
      return <FontAwesome name="chevron-up" {...props} />;
    }
    return <FontAwesome name="images" {...props} />;
  }, []);


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.mainText}>Theme</Text>
      </View>
      {_themes.map((value, index) => (
        <TouchableHighlight
          key={index}
          underlayColor="transparent"
          onPress={() => {
            setTheme(value.label);
          }}
        >
          <View
            style={{
              ...styles.chatChoiceButton,
              ...getDynamicViewStyle(themeName, value.label, theme),
            }}
          >
            <Text
              style={{
                ...styles.chatTypeText,
                ...getDynamicTextStyle(themeName, value.label, theme),
              }}
            >
              {value.name}
            </Text>
          </View>
        </TouchableHighlight>
      ))}
      <View style={styles.titleContainer}>
        <Text style={styles.mainText}>Chat Model</Text>
      </View>
      <View style={styles.buttonContainer}>
        {models.map((model, index) => (
          <TouchableHighlight
            key={index}
            underlayColor="transparent"
            onPress={() => {
              setChatType(model);
            }}
          >
            <View
              style={{
                ...styles.chatChoiceButton,
                ...getDynamicViewStyle(chatType.label, model.label, theme),
              }}
            >
              {renderIcon({
                type: model.label,
                props: {
                  theme,
                  size: 18,
                  style: { marginRight: 8 },
                  selected: chatType.label === model.label,
                },
              })}
              <Text
                style={{
                  ...styles.chatTypeText,
                  ...getDynamicTextStyle(chatType.label, model.label, theme),
                }}
              >
                {model.name}
              </Text>
            </View>
          </TouchableHighlight>
        ))}
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.mainText}>Image Model</Text>
      </View>
      <View style={styles.buttonContainer}>
        {imageModels.map((model, index) => (
          <TouchableHighlight
            key={index}
            underlayColor="transparent"
            onPress={() => {
              setImageModel(model.label);
            }}
          >
            <View
              style={{
                ...styles.chatChoiceButton,
                ...getDynamicViewStyle(imageModel, model.label, theme),
              }}
            >
              {renderIcon({
                type: model.label,
                props: {
                  theme,
                  size: 18,
                  style: { marginRight: 8 },
                  color:
                    imageModel === model.label
                      ? theme.tintTextColor
                      : theme.textColor,
                },
              })}
              <Text
                style={{
                  ...styles.chatTypeText,
                  ...getDynamicTextStyle(imageModel, model.label, theme),
                }}
              >
                {model.name}
              </Text>
            </View>
          </TouchableHighlight>
        ))}
      </View>
    </ScrollView>
  );
}

// Function to get dynamic text styles based on the selected type
function getDynamicTextStyle(baseType: string, type: string, theme: any) {
  if (type === baseType) {
    return {
      color: theme.tintTextColor,
    };
  } else return {};
}

// Function to get dynamic view styles based on the selected type
function getDynamicViewStyle(baseType: string, type: string, theme: any) {
  if (type === baseType) {
    return {
      backgroundColor: theme.tintColor,
    };
  } else return {};
}

// Function to get styles based on the current theme
const getStyles = (theme: any) =>
  StyleSheet.create({
    buttonContainer: {
      marginBottom: 20,
    },
    container: {
      padding: 14,
      flex: 1,
      backgroundColor: theme.backgroundColor,
      paddingTop: 10,
    },
    contentContainer: {
      paddingBottom: 40,
    },
    titleContainer: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      marginTop: 10,
    },
    chatChoiceButton: {
      padding: 15,
      borderRadius: 8,
      flexDirection: "row",
    },
    chatTypeText: {
      fontFamily: theme.semiBoldFont,
      color: theme.textColor,
    },
    mainText: {
      fontFamily: theme.boldFont,
      fontSize: 18,
      color: theme.textColor,
    },
  });

export default Settings;
