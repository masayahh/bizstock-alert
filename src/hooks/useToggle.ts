import { useCallback, useState } from 'react';

/**
 * Toggle hook - manage boolean state with helper functions
 * @param initialValue - Initial boolean value
 * @returns [value, toggle, setTrue, setFalse]
 *
 * @example
 * const [isOpen, toggle, open, close] = useToggle(false);
 *
 * <Modal visible={isOpen} onClose={close}>
 *   <Button onPress={toggle}>Toggle</Button>
 * </Modal>
 */
export function useToggle(
  initialValue = false,
): [boolean, () => void, () => void, () => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setTrue, setFalse];
}

export default useToggle;
