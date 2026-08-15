import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

export type DownloadProgress = {
  progress: number;
  totalBytes: number | null;
  writtenBytes: number;
};

export async function downloadAndInstallApk(
  apkUrl: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  if (Platform.OS !== 'android') {
    throw new Error('In-app APK install is only supported on Android.');
  }
  if (!FileSystem.documentDirectory) {
    throw new Error('Document directory is unavailable.');
  }

  const target = `${FileSystem.documentDirectory}Canal-Study-update.apk`;
  const callback = (data: {
    totalBytesWritten: number;
    totalBytesExpectedToWrite: number;
  }) => {
    const total = data.totalBytesExpectedToWrite;
    const written = data.totalBytesWritten;
    onProgress?.({
      writtenBytes: written,
      totalBytes: total > 0 ? total : null,
      progress: total > 0 ? written / total : 0,
    });
  };

  const task = FileSystem.createDownloadResumable(apkUrl, target, {}, callback);
  const result = await task.downloadAsync();
  if (!result?.uri) {
    throw new Error('Download failed.');
  }

  const contentUri = await FileSystem.getContentUriAsync(result.uri);
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1,
    type: 'application/vnd.android.package-archive',
  });
}
