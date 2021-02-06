import { isPresent } from "ts-is-present";

export type RecentlyViewedLink = {
  title: string;
  url: string;
};

type StorageRoot = {
  links: Array<RecentlyViewedLink>;
};

const LOCAL_STORAGE_KEY = 'recently-viewed.v1';
const MAXIMUM_RECENT = 10;

function loadStorageRoot(): StorageRoot | undefined {
  const { localStorage } = window;

  const recentlyViewed = localStorage?.getItem(LOCAL_STORAGE_KEY);
  if (!isPresent(recentlyViewed)) {
    return undefined;
  }

  try {
    const root: StorageRoot = JSON.parse(recentlyViewed);

    return root;
  } catch (e) {
    return undefined;
  }
}

function saveStorageRoot(root: StorageRoot): void {
  window.localStorage?.setItem(LOCAL_STORAGE_KEY, JSON.stringify(root, null, 2));
}

export function getRecentlyViewedLinks(): Array<RecentlyViewedLink> | undefined {
  return loadStorageRoot()?.links;
}

export function addRecentlyViewedLink(link: RecentlyViewedLink): void {
  let root = loadStorageRoot();

  if (!isPresent(root)) {
    root = {
      links: [link]
    };
  } else {
    const previousLinks = root.links;
    const linksWithoutCurrent = previousLinks.filter(prevLink => link.url !== prevLink.url);
    root = {
      links: [link, ...linksWithoutCurrent].slice(0, MAXIMUM_RECENT)
    };
  }

  saveStorageRoot(root);
}