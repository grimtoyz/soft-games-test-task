import { Assets } from 'pixi.js';
import { ASSET_BUNDLES } from '../config/assetsManifest';
import * as PIXI from 'pixi.js';
import { getAvatarTextureName } from '../helpers/text/TextureNameHelper';

type DynamicAsset = {
  name: string;
  url: string;
};

type Avatar = {
  name: string;
  url: string;
};

export class AssetLoader {
  private static preloadBundles = new Set<string>();
  private static registeredBundles = new Set<string>();
  private static initialized = false;

  public static async init(): Promise<void> {
    if (this.initialized) return;

    await Assets.init({
      loadOptions: {
        onError: (error, asset) => {
          const assetId = typeof asset === 'string' ? asset : asset.src;
          console.warn(`[Global Error Handler] Failed to load: ${assetId}`, error);
        },
        strategy: 'skip',
      },
    });

    Object.entries(ASSET_BUNDLES).forEach(([bundleName, bundleAssets]) => {
      Assets.addBundle(bundleName, bundleAssets);
      this.preloadBundles.add(bundleName);
    });

    this.initialized = true;
  }

  public static addDynamicBundle(config: DynamicAsset[], bundleName: string): void {
    const bundle = config.map((asset) => ({
      alias: this.makeAlias(bundleName, asset.name),
      src: asset.url,
      parser: 'loadTextures',
    }));

    Assets.addBundle(bundleName, bundle);
    this.registeredBundles.add(bundleName);
  }

  public static async preloadStatic(onProgress?: (progress: number) => void): Promise<void> {
    const bundles = Array.from(this.preloadBundles);

    let loaded = 0;

    for (const bundleName of bundles) {
      await Assets.loadBundle(bundleName);

      loaded++;
      onProgress?.(loaded / bundles.length);
    }
  }

  public static async loadAvatarsSequential(avatars: Avatar[]) {
    const result: Record<string, PIXI.Texture> = {};
    const fallbackTexture = PIXI.Assets.get('missing_avatar.png');

    for (const avatar of avatars) {
      try {
        const texture = await PIXI.Assets.load({
          src: avatar.url,
          parser: 'loadTextures',
        });

        const avatarTextureAlias = getAvatarTextureName(avatar.name);
        if (texture) {
          PIXI.Assets.cache.set(avatarTextureAlias, texture);
          result[avatar.name] = texture;
        } else {
          PIXI.Assets.cache.set(avatarTextureAlias, fallbackTexture);
          result[avatar.name] = fallbackTexture;
        }
      } catch (e) {
        console.warn(`Avatar failed to load: ${avatar.name.toLowerCase()}`, avatar.url);

        PIXI.Assets.cache.set(`avatars-${avatar.name}`, fallbackTexture);
        result[avatar.name] = fallbackTexture;
      }
    }

    return result;
  }

  public static async loadRest(onProgress?: (progress: number) => void): Promise<void> {
    const bundles = Array.from(this.registeredBundles);

    let loaded = 0;

    for (const bundleName of bundles) {
      await Assets.loadBundle(bundleName);

      loaded++;
      onProgress?.(loaded / bundles.length);
    }
  }

  public static makeAlias(bundleName: string, rawName: string): string {
    const normalizedName = rawName.trim().toLowerCase().replace(/\s+/g, '-');

    return normalizedName.startsWith(`${bundleName}-`)
      ? normalizedName
      : `${bundleName}-${normalizedName}`;
  }
}
