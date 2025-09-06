import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

export interface SettingsBlockProps {
  title: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

/**
 * A simple labelled toggle used in the settings screen. It adheres to
 * the Calm Black design spec by using dark backgrounds and a green accent
 * colour when enabled.
 */
export default function SettingsBlock({
  title,
  value,
  onToggle,
}: SettingsBlockProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        thumbColor={value ? COLORS.accent : '#f4f3f4'}
        trackColor={{ false: '#767577', true: '#22c55e' }}
      />
    </View>
  );
}

const COLORS = {
  text: '#ffffff',
  accent: '#16a34a',
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
  },
});