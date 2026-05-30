import { PropsWithChildren } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const wf = {
  colors: {
    ink: '#1f2933',
    muted: '#667085',
    line: '#344054',
    soft: '#f6f8fa',
    panel: '#ffffff',
    accent: '#e8f1ff',
    page: '#f1f3f5',
    dangerBg: '#fff5f5',
    dangerText: '#b42318',
  },
  radius: {
    md: 12,
    lg: 16,
  },
  border: {
    width: 2,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
  },
};

export function Screen({
  title,
  subtitle,
  children,
  scroll = true,
}: PropsWithChildren<{ title: string; subtitle?: string; scroll?: boolean }>) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>{title}</Text>
        {subtitle ? <Text style={styles.appBarSubtitle}>{subtitle}</Text> : null}
      </View>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={styles.body}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Placeholder({
  label,
  minHeight = 140,
}: {
  label: string;
  minHeight?: number;
}) {
  return (
    <View style={[styles.placeholder, { minHeight }]}>
      <Text style={styles.placeholderText}>{label}</Text>
    </View>
  );
}

export function Card({
  children,
  style,
}: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Box({
  children,
  style,
}: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.box, style]}>{children}</View>;
}

export function Metric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' ? styles.buttonSecondary : styles.buttonPrimary,
        size === 'lg' ? styles.buttonLg : null,
        pressed && !disabled ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null,
      ]}>
      <Text
        style={[
          styles.buttonText,
          variant === 'secondary' ? styles.buttonTextSecondary : null,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={wf.colors.muted}
        style={styles.input}
        autoCapitalize="none"
        secureTextEntry={secureTextEntry}
        textContentType={Platform.select({
          ios: secureTextEntry ? 'password' : 'username',
        })}
      />
    </View>
  );
}

export function StatusBox({ text }: { text: string }) {
  return (
    <View style={styles.statusBox}>
      <Text style={styles.statusBoxText}>{text}</Text>
    </View>
  );
}

export function WireNote({ text }: { text: string }) {
  return (
    <View style={styles.wireNote}>
      <Text style={styles.wireNoteText}>{text}</Text>
    </View>
  );
}

export function Tabs3({
  value,
  onChange,
  labels,
}: {
  value: number;
  onChange: (index: number) => void;
  labels: [string, string, string];
}) {
  return (
    <View style={styles.tabs}>
      {labels.map((label, idx) => {
        const active = idx === value;
        return (
          <Pressable
            key={label}
            onPress={() => onChange(idx)}
            style={[
              styles.tab,
              active ? styles.tabActive : null,
              idx === 0 ? styles.tabFirst : null,
              idx === labels.length - 1 ? styles.tabLast : null,
            ]}>
            <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: wf.colors.page,
  },
  appBar: {
    backgroundColor: wf.colors.soft,
    borderBottomColor: wf.colors.line,
    borderBottomWidth: wf.border.width,
    paddingHorizontal: wf.spacing.lg,
    paddingTop: wf.spacing.md,
    paddingBottom: wf.spacing.md,
  },
  appBarTitle: {
    color: wf.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  appBarSubtitle: {
    marginTop: 2,
    color: wf.colors.muted,
    fontSize: 13,
  },
  body: {
    padding: wf.spacing.lg,
    paddingBottom: wf.spacing.lg + 64,
    gap: wf.spacing.md,
  },
  card: {
    backgroundColor: wf.colors.panel,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.lg,
    padding: wf.spacing.md,
  },
  box: {
    backgroundColor: wf.colors.panel,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    padding: wf.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: wf.spacing.sm,
    paddingVertical: wf.spacing.sm,
    borderBottomColor: wf.colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    width: 120,
    color: wf.colors.muted,
    fontSize: 14,
  },
  rowValue: {
    flex: 1,
    color: wf.colors.ink,
    fontSize: 14,
  },
  placeholder: {
    backgroundColor: wf.colors.panel,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: wf.spacing.md,
  },
  placeholderText: {
    color: wf.colors.muted,
    textAlign: 'center',
  },
  metric: {
    flex: 1,
    backgroundColor: wf.colors.panel,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    padding: wf.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  metricValue: {
    color: wf.colors.ink,
    fontSize: 22,
    fontWeight: '700',
  },
  metricLabel: {
    color: wf.colors.muted,
    fontSize: 12,
  },
  button: {
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    paddingVertical: wf.spacing.md,
    paddingHorizontal: wf.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: wf.colors.panel,
  },
  buttonSecondary: {
    backgroundColor: wf.colors.soft,
  },
  buttonText: {
    color: wf.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextSecondary: {
    fontWeight: '500',
  },
  buttonLg: {
    paddingVertical: 18,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  field: {
    gap: wf.spacing.xs,
  },
  fieldLabel: {
    color: wf.colors.muted,
    fontSize: 13,
  },
  input: {
    backgroundColor: wf.colors.panel,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    paddingVertical: wf.spacing.md,
    paddingHorizontal: wf.spacing.md,
    color: wf.colors.ink,
    fontSize: 14,
  },
  statusBox: {
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderStyle: 'dashed',
    borderRadius: wf.radius.md,
    padding: wf.spacing.md,
    backgroundColor: '#fafafa',
  },
  statusBoxText: {
    color: wf.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  wireNote: {
    borderColor: wf.colors.line,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: wf.radius.md,
    padding: wf.spacing.md,
    backgroundColor: '#fafafa',
  },
  wireNoteText: {
    color: wf.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  tabs: {
    flexDirection: 'row',
    gap: wf.spacing.sm,
  },
  tab: {
    flex: 1,
    backgroundColor: wf.colors.panel,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    paddingVertical: wf.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: wf.colors.accent,
  },
  tabText: {
    color: wf.colors.ink,
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  tabFirst: {},
  tabLast: {},
});

