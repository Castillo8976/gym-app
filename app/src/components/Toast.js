import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, sizes } from '../theme';

const AUTO_HIDE_MS = 3500;

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onDismiss, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <View accessibilityLiveRegion="polite" pointerEvents="box-none" style={styles.container}>
      <Pressable
        accessibilityLabel={`${message}. Toca para cerrar`}
        accessibilityRole="alert"
        hitSlop={8}
        onPress={onDismiss}
        style={styles.toast}
      >
        <Text style={styles.message}>{message}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    bottom: sizes.bottomBar + 12,
    left: 18,
    position: 'absolute',
    right: 18,
    zIndex: 20,
  },
  toast: {
    alignSelf: 'center',
    backgroundColor: colors.surfacePressed,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    minHeight: sizes.minTouchTarget,
    paddingHorizontal: 16,
    paddingVertical: 11,
    justifyContent: 'center',
  },
  message: {
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
