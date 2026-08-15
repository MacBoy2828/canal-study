import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

import { getUpdatesConfig, isUpdatesConfigured } from './config';
import { fetchLatestRelease, hasNewerRelease, type LatestRelease } from './github';
import { downloadAndInstallApk, type DownloadProgress } from './installer';

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'upToDate'
  | 'downloading'
  | 'installing'
  | 'error'
  | 'unsupported'
  | 'unconfigured';

function getLocalVersion(): string {
  return (
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    '0.0.0'
  );
}

export function useAppUpdate(options?: { checkOnMount?: boolean }) {
  const checkOnMount = options?.checkOnMount ?? true;
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [latest, setLatest] = useState<LatestRelease | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const dismissedRef = useRef<string | null>(null);
  const localVersion = getLocalVersion();

  const checkForUpdate = useCallback(
    async (opts?: { interactive?: boolean }) => {
      const interactive = opts?.interactive ?? false;

      if (Platform.OS !== 'android') {
        setStatus('unsupported');
        setError('Automatic installs are Android-only. Use the App Store on iOS.');
        if (interactive) setModalVisible(true);
        return null;
      }

      if (!isUpdatesConfigured()) {
        setStatus('unconfigured');
        setError(
          'Set expo.extra.updates.githubOwner (and repo) in app.json, then rebuild the APK.'
        );
        if (interactive) setModalVisible(true);
        return null;
      }

      setStatus('checking');
      setError(null);
      try {
        const release = await fetchLatestRelease();
        if (!release) {
          setLatest(null);
          setStatus('upToDate');
          if (interactive) setModalVisible(true);
          return null;
        }

        if (!hasNewerRelease(release, localVersion)) {
          setLatest(release);
          setStatus('upToDate');
          if (interactive) setModalVisible(true);
          return null;
        }

        setLatest(release);
        setStatus('available');
        if (interactive || dismissedRef.current !== release.version) {
          setModalVisible(true);
        }
        return release;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Could not check for updates.';
        setError(message);
        setStatus('error');
        if (interactive) setModalVisible(true);
        return null;
      }
    },
    [localVersion]
  );

  useEffect(() => {
    if (!checkOnMount) return;
    const timer = setTimeout(() => {
      void checkForUpdate({ interactive: false });
    }, 1200);
    return () => clearTimeout(timer);
  }, [checkOnMount, checkForUpdate]);

  const dismiss = useCallback(() => {
    if (latest) {
      dismissedRef.current = latest.version;
    }
    setModalVisible(false);
  }, [latest]);

  const startUpdate = useCallback(async () => {
    if (!latest) return;
    if (Platform.OS !== 'android') return;

    setStatus('downloading');
    setProgress({ progress: 0, totalBytes: null, writtenBytes: 0 });
    setError(null);
    try {
      await downloadAndInstallApk(latest.apkUrl, (p) => {
        setProgress(p);
        if (p.progress >= 0.99) setStatus('installing');
      });
      setStatus('installing');
      setModalVisible(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Download or install failed.';
      setError(message);
      setStatus('error');
    }
  }, [latest]);

  return {
    status,
    latest,
    error,
    progress,
    modalVisible,
    localVersion,
    configured: isUpdatesConfigured(getUpdatesConfig()),
    config: getUpdatesConfig(),
    checkForUpdate,
    startUpdate,
    dismiss,
    setModalVisible,
  };
}
