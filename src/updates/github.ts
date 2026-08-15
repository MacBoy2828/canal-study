import { getUpdatesConfig, isUpdatesConfigured } from './config';
import { isRemoteNewer, normalizeVersion } from './semver';

export type LatestRelease = {
  version: string;
  tagName: string;
  name: string;
  body: string;
  apkUrl: string;
  htmlUrl: string;
};

type GithubAsset = {
  name: string;
  browser_download_url: string;
  content_type?: string;
};

type GithubRelease = {
  tag_name: string;
  name: string | null;
  body: string | null;
  html_url: string;
  draft?: boolean;
  prerelease?: boolean;
  assets: GithubAsset[];
};

export async function fetchLatestRelease(): Promise<LatestRelease | null> {
  const config = getUpdatesConfig();
  if (!isUpdatesConfigured(config)) {
    return null;
  }

  const url = `https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}/releases/latest`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Canal-Study-Updater',
    },
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GitHub release check failed (${response.status})`);
  }

  const release = (await response.json()) as GithubRelease;
  if (release.draft || release.prerelease) {
    return null;
  }

  const apk =
    release.assets.find(
      (asset) => asset.name.toLowerCase() === config.apkAssetName.toLowerCase()
    ) ??
    release.assets.find((asset) => asset.name.toLowerCase().endsWith('.apk'));

  if (!apk?.browser_download_url) {
    throw new Error(
      `No APK asset found on latest release. Expected "${config.apkAssetName}".`
    );
  }

  return {
    version: normalizeVersion(release.tag_name),
    tagName: release.tag_name,
    name: release.name ?? release.tag_name,
    body: release.body ?? '',
    apkUrl: apk.browser_download_url,
    htmlUrl: release.html_url,
  };
}

export function hasNewerRelease(
  latest: LatestRelease,
  localVersion: string
): boolean {
  return isRemoteNewer(latest.version, localVersion);
}
