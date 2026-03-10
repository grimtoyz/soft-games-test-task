
export class ResizeModel {
	private _isPortrait: boolean;

	set isPortrait(value: boolean): void {
		this._isPortrait = value;
	}

	get isPortrait(): boolean {
		return this._isPortrait;
	}
}