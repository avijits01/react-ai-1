import { useContext } from 'react';
import { ThemeContext, AppContext } from '../context';
import { MODELS } from '../../constants';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';

// ChatModelModal component definition
export function ChatModelModal({ handlePresentModalPress }) {
  // Extract theme from ThemeContext
  const { theme } = useContext(ThemeContext);
  // Extract setChatType and chatType from AppContext
  const { setChatType, chatType } = useContext(AppContext);
  // Get styles based on the current theme
  const styles = getStyles(theme);
  // Get list of model options from MODELS constant
  const options = Object.values(MODELS);

  // Function to set chat type and close the modal
  function _setChatType(v) {
    setChatType(v);
    handlePresentModalPress();
  }

  return (
    <View style={styles.bottomSheetContainer}>
      <View>
        {/* Title Text for Language Models */}
        <View style={styles.chatOptionsTextContainer}>
          <Text style={styles.chatOptionsText}>
            Language Models
          </Text>
        </View>
        {/* List of model options */}
        {options.map((option, index) => (
          <TouchableHighlight
            underlayColor={'transparent'}
            onPress={() => _setChatType(option)}
            key={index}>
            {/* Option container */}
            <View style={optionContainer(theme, chatType.label, option.label)}>
              {/* Option icon */}
              <option.icon
                size={20}
                theme={theme}
                selected={chatType.label === option.label}
              />
              {/* Option name */}
              <Text style={optionText(theme, chatType.label, option.label)}>
                {option.name}
              </Text>
            </View>
          </TouchableHighlight>
        ))}
      </View>
    </View>
  );
}

// Function to get styles based on theme
function getStyles(theme) {
  return StyleSheet.create({
    closeIconContainer: {
      position: 'absolute',
      right: 3,
      top: 3,
    },
    chatOptionsTextContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    logo: {
      width: 22, 
      height: 17,
      marginRight: 10,
    },
    chatOptionsText: {
      color: theme.textColor,
      marginBottom: 22,
      textAlign: 'center',
      fontSize: 16,
      fontFamily: theme.semiBoldFont,
      marginLeft: 10,
    },
    bottomSheetContainer: {
      borderColor: theme.borderColor,
      borderWidth: 1,
      padding: 24,
      justifyContent: 'center',
      backgroundColor: theme.backgroundColor,
      marginHorizontal: 14,
      marginBottom: 24,
      borderRadius: 20,
    },
  });
}

// Function to style option container based on theme and selection state
function optionContainer(theme, baseType, type) {
  const selected = baseType === type;
  return {
    backgroundColor: selected ? theme.tintColor : theme.backgroundColor,
    padding: 12,
    borderRadius: 8,
    marginBottom: 9,
    flexDirection: 'row' as 'row',
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
  };
}

// Function to style option text based on theme and selection state
function optionText(theme, baseType, type) {
  const selected = baseType === type;
  return {
    color: selected ? theme.tintTextColor : theme.textColor,
    fontFamily: theme.boldFont,
    fontSize: 15,
    shadowColor: 'rgba(0, 0, 0, .2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginLeft: 5,
  };
}
