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
    ink: '#101828',
    muted: '#475467',
    line: '#D0D5DD',
    soft: '#F9FAFB',
    panel: '#FFFFFF',
    accent: '#EEF4FF',
    page: '#F2F4F7',
    primary: '#1570EF',
    primaryDark: '#175CD3',
    dangerBg: '#FEF3F2',
    dangerText: '#B42318',
  },
  radius: {
    md: 14,
    lg: 18,
  },
  border: {
    width: 1,
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
          variant === 'secondary' ? styles.buttonTextSecondary : styles.buttonTextPrimary,
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
    backgroundColor: wf.colors.panel,
    borderBottomColor: wf.colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: wf.spacing.lg,
    paddingTop: wf.spacing.md,
    paddingBottom: wf.spacing.md,
  },
  appBarTitle: {
    color: wf.colors.ink,
    fontSize: 19,
    fontWeight: '700',
  },
  appBarSubtitle: {
    marginTop: 2,
    color: wf.colors.muted,
    fontSize: 13,
    lineHeight: 18,
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
    shadowColor: '#101828',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  box: {
    backgroundColor: wf.colors.panel,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    padding: wf.spacing.md,
    shadowColor: '#101828',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    gap: wf.spacing.sm,
    paddingVertical: wf.spacing.sm,
    borderBottomColor: wf.colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    width: 118,
    color: wf.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  rowValue: {
    flex: 1,
    color: wf.colors.ink,
    fontSize: 14,
    lineHeight: 20,
  },
  placeholder: {
    backgroundColor: wf.colors.panel,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: wf.spacing.md,
    shadowColor: '#101828',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  placeholderText: {
    color: wf.colors.muted,
    textAlign: 'center',
    lineHeight: 18,
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
    shadowColor: '#101828',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  metricValue: {
    color: wf.colors.ink,
    fontSize: 22,
    fontWeight: '700',
  },
  metricLabel: {
    color: wf.colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    paddingVertical: wf.spacing.md,
    paddingHorizontal: wf.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: wf.colors.primary,
    borderColor: wf.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: wf.colors.panel,
    borderColor: wf.colors.line,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: wf.colors.ink,
    fontWeight: '600',
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
    lineHeight: 18,
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
    lineHeight: 20,
  },
  statusBox: {
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderStyle: 'dashed',
    borderRadius: wf.radius.md,
    padding: wf.spacing.md,
    backgroundColor: wf.colors.soft,
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
    backgroundColor: wf.colors.soft,
  },
  wireNoteText: {
    color: wf.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: wf.colors.soft,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.lg,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    backgroundColor: 'transparent',
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
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  tabFirst: {},
  tabLast: {},
});

