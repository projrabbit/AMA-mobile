import { Tabs } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { wf } from '@/components/Wireframe';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 52 + insets.bottom;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: wf.colors.ink,
        tabBarInactiveTintColor: wf.colors.muted,
        tabBarIcon: () => null,
        tabBarIconStyle: styles.hideIcon,
        tabBarButton: (props) => {
          const selected = Boolean(props.accessibilityState?.selected);
          const { style, children } = props;
          return (
            <Pressable
              onPress={props.onPress}
              onLongPress={props.onLongPress}
              accessibilityRole={props.accessibilityRole}
              accessibilityState={props.accessibilityState}
              accessibilityLabel={props.accessibilityLabel}
              accessibilityHint={props.accessibilityHint}
              testID={props.testID}
              style={({ pressed }) => [
                style,
                styles.button,
                { paddingBottom: insets.bottom },
                selected ? styles.buttonActive : null,
                pressed ? styles.buttonPressed : null,
              ]}>
              {children}
            </Pressable>
          );
        },
        tabBarStyle: {
          backgroundColor: wf.colors.panel,
          borderColor: wf.colors.line,
          borderWidth: wf.border.width,
          borderRadius: wf.radius.lg,
          overflow: 'hidden',
          position: 'absolute',
          left: wf.spacing.lg,
          right: wf.spacing.lg,
          bottom: 0,
          height: tabBarHeight,
          paddingBottom: 0,
          paddingTop: 0,
          shadowColor: '#101828',
          shadowOpacity: 0.1,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 10 },
          zIndex: 50,
          elevation: 12,
        },
        tabBarItemStyle: styles.item,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          includeFontPadding: false,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarItemStyle: [styles.item, styles.divider],
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Lịch sử',
          tabBarItemStyle: [styles.item, styles.divider],
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarItemStyle: [styles.item, styles.divider],
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Tài khoản',
          tabBarItemStyle: styles.item,
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  hideIcon: {
    display: 'none',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: wf.colors.accent,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  item: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    borderRightColor: wf.colors.line,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
});
