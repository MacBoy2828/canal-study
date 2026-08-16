import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PressableScale } from '@/src/components/PressableScale';
import { colors, fonts, motion, radius, shadows, spacing } from '@/src/theme';
import type { DownloadProgress } from '@/src/updates/installer';
import type { LatestRelease } from '@/src/updates/github';
import type { UpdateStatus } from '@/src/updates/useAppUpdate';

type Props = {
  visible: boolean;
  status: UpdateStatus;
  latest: LatestRelease | null;
  localVersion: string;
  error: string | null;
  progress: DownloadProgress | null;
  onDismiss: () => void;
  onConfirm: () => void;
  onRetryCheck: () => void;
};

function statusCopy(
  status: UpdateStatus,
  latest: LatestRelease | null,
  localVersion: string,
  error: string | null
): { title: string; body: string } {
  switch (status) {
    case 'checking':
      return { title: 'Checking for updates', body: 'Looking up the latest release…' };
    case 'available':
      return {
        title: 'Update available',
        body: `Version ${latest?.version ?? ''} is ready (you have ${localVersion}). Your cards and settings stay on this phone when you update — do not uninstall first.${
          latest?.body?.trim()
            ? `\n\n${latest.body.trim().slice(0, 280)}`
            : ''
        }`,
      };
    case 'upToDate':
      return {
        title: 'You’re up to date',
        body: `Canal Study ${localVersion} is the latest version.`,
      };
    case 'downloading':
      return {
        title: 'Downloading update',
        body: 'Please keep the app open until the installer opens.',
      };
    case 'installing':
      return {
        title: 'Ready to install',
        body: 'Confirm the Android install prompt to finish updating.',
      };
    case 'unconfigured':
      return {
        title: 'Updates not configured',
        body: error ?? 'Set your GitHub owner/repo in app.json.',
      };
    case 'unsupported':
      return {
        title: 'Updates on this device',
        body: error ?? 'In-app install works on Android release builds.',
      };
    case 'error':
      return {
        title: 'Update check failed',
        body: error ?? 'Something went wrong.',
      };
    default:
      return { title: 'Updates', body: '' };
  }
}

export function UpdateModal({
  visible,
  status,
  latest,
  localVersion,
  error,
  progress,
  onDismiss,
  onConfirm,
  onRetryCheck,
}: Props) {
  const copy = statusCopy(status, latest, localVersion, error);
  const busy = status === 'checking' || status === 'downloading' || status === 'installing';
  const canInstall = status === 'available';
  const showRetry = status === 'error' || status === 'upToDate';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <Animated.View
          entering={FadeInDown.duration(motion.lush).springify().damping(18)}
          style={styles.card}
        >
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.body}>{copy.body}</Text>

          {busy ? (
            <ActivityIndicator color={colors.orange} style={{ marginVertical: spacing.md }} />
          ) : null}

          {status === 'downloading' && progress ? (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(4, Math.round(progress.progress * 100))}%` },
                ]}
              />
            </View>
          ) : null}

          {status === 'downloading' && progress ? (
            <Text style={styles.progressLabel}>
              {Math.round(progress.progress * 100)}%
            </Text>
          ) : null}

          <View style={styles.actions}>
            <PressableScale
              onPress={onDismiss}
              style={styles.secondary}
              disabled={status === 'downloading'}
            >
              <Text style={styles.secondaryText}>
                {canInstall ? 'Later' : 'Close'}
              </Text>
            </PressableScale>

            {canInstall ? (
              <PressableScale onPress={onConfirm} style={styles.primary}>
                <Text style={styles.primaryText}>Download & install</Text>
              </PressableScale>
            ) : null}

            {showRetry ? (
              <PressableScale onPress={onRetryCheck} style={styles.primary}>
                <Text style={styles.primaryText}>Check again</Text>
              </PressableScale>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.sheet,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    ...shadows.float,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.slate,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.mist,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
  },
  progressLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.slate,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  secondary: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  secondaryText: {
    fontFamily: fonts.bodySemi,
    color: colors.slate,
    fontSize: 16,
  },
  primary: {
    flexGrow: 1,
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    ...shadows.soft,
  },
  primaryText: {
    fontFamily: fonts.bodySemi,
    color: colors.white,
    fontSize: 16,
  },
});
