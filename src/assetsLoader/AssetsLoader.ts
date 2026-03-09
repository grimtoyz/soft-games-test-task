import { Assets } from 'pixi.js';
import { ASSET_BUNDLES } from '../config/assetsManifest';

type DynamicAsset = {
	name: string;
	url: string;
};

export class AssetLoader {
	private static registeredBundles = new Set<string>();
	private static initialized = false;

	public static async init(): Promise<void> {
		if (this.initialized) return;

		Object.entries(ASSET_BUNDLES).forEach(([bundleName, bundleAssets]) => {
			Assets.addBundle(bundleName, bundleAssets);
			this.registeredBundles.add(bundleName);
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

	public static async preloadAll(onProgress?: (progress: number) => void): Promise<void> {
		const bundles = Array.from(this.registeredBundles);

		let loaded = 0;

		for (const bundleName of bundles) {
			await Assets.loadBundle(bundleName);

			loaded++;
			onProgress?.(loaded / bundles.length);
		}
	}

	public static makeAlias(bundleName: string, rawName: string): string {
		const normalizedName = rawName
			.trim()
			.toLowerCase()
			.replace(/\s+/g, '-');

		return normalizedName.startsWith(`${bundleName}-`)
			? normalizedName
			: `${bundleName}-${normalizedName}`;
	}
}