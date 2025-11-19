import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

export interface KeyboardInfo {
  keyboardShown: boolean;
  keyboardHeight: number;
}

/**
 * Keyboard hook - track keyboard visibility and height
 * @returns Keyboard info object
 *
 * @example
 * const { keyboardShown, keyboardHeight } = useKeyboard();
 *
 * <View style={{ marginBottom: keyboardShown ? keyboardHeight : 0 }}>
 *   <TextInput />
 * </View>
 */
export function useKeyboard(): KeyboardInfo {
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      'keyboardDidShow',
      (e: KeyboardEvent) => {
        setKeyboardShown(true);
        setKeyboardHeight(e.endCoordinates.height);
      },
    );

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardShown(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return { keyboardShown, keyboardHeight };
}

export default useKeyboard;
