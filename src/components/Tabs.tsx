import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';

import { colors, textStyles, spacing, borderRadius } from '../theme';

export interface Tab {
  key: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
}

export interface TabsProps {
  /** Array of tabs */
  tabs: Tab[];
  /** Initially active tab key */
  initialTab?: string;
  /** Tab change callback */
  onTabChange?: (tabKey: string) => void;
  /** Variant */
  variant?: 'default' | 'pills';
}

/**
 * Professional tabs component with smooth animations
 * Supports default and pill variants
 */
const Tabs = React.memo(
  ({ tabs, initialTab, onTabChange, variant = 'default' }: TabsProps) => {
    const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.key);
    const [indicatorAnim] = useState(new Animated.Value(0));

    const handleTabPress = (tabKey: string, index: number) => {
      setActiveTab(tabKey);
      onTabChange?.(tabKey);

      // Animate indicator
      Animated.spring(indicatorAnim, {
        toValue: index,
        friction: 8,
        useNativeDriver: true,
      }).start();
    };

    const activeTabContent = tabs.find((tab) => tab.key === activeTab)?.content;

    const renderDefaultTabs = () => (
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
        >
          {tabs.map((tab, index) => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleTabPress(tab.key, index)}
                style={[styles.tab, isActive && styles.tabActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
              >
                {tab.icon && <Text style={styles.tabIcon}>{tab.icon}</Text>}
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.indicator}>
          <Animated.View
            style={[
              styles.indicatorBar,
              {
                transform: [
                  {
                    translateX: indicatorAnim.interpolate({
                      inputRange: tabs.map((_, i) => i),
                      outputRange: tabs.map((_, i) => i * 100), // Approximate
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
    );

    const renderPillTabs = () => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsContainer}
        contentContainerStyle={styles.pillsContent}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabPress(tab.key, 0)}
              style={[styles.pill, isActive && styles.pillActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              {tab.icon && <Text style={styles.pillIcon}>{tab.icon}</Text>}
              <Text
                style={[styles.pillLabel, isActive && styles.pillLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );

    return (
      <View style={styles.container}>
        {variant === 'default' ? renderDefaultTabs() : renderPillTabs()}
        <View style={styles.content}>{activeTabContent}</View>
      </View>
    );
  },
);

Tabs.displayName = 'Tabs';

export default Tabs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tab: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabActive: {
    // Active state handled by indicator
  },
  tabIcon: {
    fontSize: 18,
    marginRight: spacing[2],
  },
  tabLabel: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  indicator: {
    height: 2,
    backgroundColor: colors.border,
  },
  indicatorBar: {
    height: 2,
    width: 80,
    backgroundColor: colors.accent,
  },
  pillsContainer: {
    flexGrow: 0,
    marginBottom: spacing[4],
  },
  pillsContent: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pillIcon: {
    fontSize: 16,
    marginRight: spacing[2],
  },
  pillLabel: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  pillLabelActive: {
    color: colors.text,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
});
