import {
  StyleSheet,
  View,
  TouchableHighlight
} from 'react-native';
import { useContext, useMemo } from 'react';
import { Icon } from './Icon';
import { ThemeContext, AppContext } from '../../src/context';
import FontAwesome from '@expo/vector-icons/FontAwesome5';

export function Header() {
  // Get the current theme context
  const { theme } = useContext(ThemeContext);
  // Get the App context to handle modal press
  const { handlePresentModalPress } = useContext(AppContext);

  // Get styles based on the theme
  const styles = useMemo(() => getStyles(theme), [theme]);
  // todo: useMemo to memoize styles based on theme to avoid recalculating styles on every render

  return (
    <View style={styles.container}>
      <Icon size={34} fill={theme.textColor} />
      <TouchableHighlight
        style={styles.buttonContainer}
        underlayColor={'transparent'}
        activeOpacity={0.6}
        onPress={handlePresentModalPress}
      >
        <FontAwesome
          name="ellipsis-h"
          size={20}
          color={theme.textColor}
        />
      </TouchableHighlight>
    </View>
  );
}

// Function to get styles based on the current theme
const getStyles = (theme: any) =>
  StyleSheet.create({
    buttonContainer: {
      position: 'absolute',
      right: 15,
      padding: 15
    },
    container: {
      paddingVertical: 15,
      backgroundColor: theme.backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor
    }
  });

export default Header;
