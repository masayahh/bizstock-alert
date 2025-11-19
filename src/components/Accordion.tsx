import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

import { colors, textStyles, spacing, borderRadius } from '../theme';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface AccordionItem {
  key: string;
  title: string;
  content: React.ReactNode;
  icon?: string;
}

export interface AccordionProps {
  /** Array of accordion items */
  items: AccordionItem[];
  /** Allow multiple items open */
  allowMultiple?: boolean;
  /** Initially expanded item keys */
  initialExpanded?: string[];
  /** Expansion change callback */
  onExpand?: (expandedKeys: string[]) => void;
}

/**
 * Professional accordion component with smooth expand/collapse
 * Supports single and multiple expansion modes
 */
const Accordion = React.memo(
  ({
    items,
    allowMultiple = false,
    initialExpanded = [],
    onExpand,
  }: AccordionProps) => {
    const [expandedKeys, setExpandedKeys] = useState<string[]>(initialExpanded);

    const handlePress = (key: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      let newExpandedKeys: string[];

      if (allowMultiple) {
        newExpandedKeys = expandedKeys.includes(key)
          ? expandedKeys.filter((k) => k !== key)
          : [...expandedKeys, key];
      } else {
        newExpandedKeys = expandedKeys.includes(key) ? [] : [key];
      }

      setExpandedKeys(newExpandedKeys);
      onExpand?.(newExpandedKeys);
    };

    const isExpanded = (key: string) => expandedKeys.includes(key);

    return (
      <View style={styles.container}>
        {items.map((item, index) => {
          const expanded = isExpanded(item.key);

          return (
            <View
              key={item.key}
              style={[
                styles.item,
                index !== items.length - 1 && styles.itemWithBorder,
              ]}
            >
              <TouchableOpacity
                onPress={() => handlePress(item.key)}
                style={styles.header}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                accessibilityLabel={item.title}
              >
                <View style={styles.headerContent}>
                  {item.icon && <Text style={styles.icon}>{item.icon}</Text>}
                  <Text style={styles.title}>{item.title}</Text>
                </View>
                <Animated.Text
                  style={[
                    styles.chevron,
                    {
                      transform: [
                        {
                          rotate: expanded ? '180deg' : '0deg',
                        },
                      ],
                    },
                  ]}
                >
                  ▼
                </Animated.Text>
              </TouchableOpacity>

              {expanded && <View style={styles.content}>{item.content}</View>}
            </View>
          );
        })}
      </View>
    );
  },
);

Accordion.displayName = 'Accordion';

export default Accordion;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  item: {
    // Individual accordion item
  },
  itemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: spacing[3],
  },
  title: {
    ...textStyles.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing[3],
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
});
