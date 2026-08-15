import Constants from 'expo-constants';

export type UpdatesConfig = {
  githubOwner: string;
  githubRepo: string;
  apkAssetName: string;
};

type Extra = {
  updates?: Partial<UpdatesConfig>;
};

export function getUpdatesConfig(): UpdatesConfig {
  const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
  return {
    githubOwner: (extra.updates?.githubOwner ?? '').trim(),
    githubRepo: (extra.updates?.githubRepo ?? 'canal-study').trim(),
    apkAssetName: (extra.updates?.apkAssetName ?? 'Canal-Study.apk').trim(),
  };
}

export function isUpdatesConfigured(config: UpdatesConfig = getUpdatesConfig()): boolean {
  const owner = config.githubOwner;
  if (!owner || !config.githubRepo) return false;
  if (owner.startsWith('REPLACE_')) return false;
  return true;
}
