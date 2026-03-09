import { Assets } from 'pixi.js';
import {ASSET_BUNDLES} from "../config/assetsManifest";

export class AssetLoader {
	static registeredBundles = new Set<string>();

	static async init() {
		Object.entries(ASSET_BUNDLES).forEach(([name, bundle]) => {
			Assets.addBundle(name, bundle);
			this.registerBundle(name);
		});
	}

	public static registerBundle(name: string) {
		this.registeredBundles.add(name);
	}

	// TODO: replace any with proper data interface
	public static async addBundle(config: any, bundleName: string): Promise<void> {
		const bundle = config.map((asset) => ({
			alias: `${bundleName}-${asset.name.toLowerCase()}`,
			src: asset.url,
		}));

		Assets.addBundle(bundleName, bundle);
		this.registerBundle(bundleName);
		// debugger
	}

	// static async loadBundle(bundle: keyof typeof ASSET_BUNDLES) {
	// 	return Assets.loadBundle(bundle);
	// }

	static async preloadAll(onProgress?: (p: number) => void) {
		const bundles = Array.from(this.registeredBundles);
		debugger

		let loaded = 0;

		for (const bundle of bundles) {
			await Assets.loadBundle(bundle);

			loaded++;
			onProgress?.(loaded / bundles.length);
		}
		console.log(Assets)
		debugger
	}

	static get<T = any>(key: string): T {
		return Assets.get(key);
	}
}