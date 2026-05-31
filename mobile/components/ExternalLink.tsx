import * as WebBrowser from 'expo-web-browser';
import type { ComponentProps } from 'react';
import { Platform, Pressable } from 'react-native';

export function ExternalLink(props: ComponentProps<typeof Pressable> & { href: string }) {
  const { href, onPress, ...otherProps } = props;
  return (
    <Pressable
      accessibilityRole="link"
      {...otherProps}
      onPress={(e) => {
        onPress?.(e);
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && typeof window.open === 'function') {
            window.open(href, '_blank', 'noopener,noreferrer');
          }
          return;
        }

        WebBrowser.openBrowserAsync(href);
      }}
    />
  );
}
