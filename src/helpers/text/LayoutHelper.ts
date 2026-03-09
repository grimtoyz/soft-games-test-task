import {
	Sprite,
	Text,
	CanvasTextMetrics,
	TextStyle,
	Texture,
} from 'pixi.js';

export function layoutInlineTokens(params: {
	tokens: Token[];
	maxWidth: number;
	textStyle: TextStyle;
	emojiTextures: Record<string, Texture>;
	emojiSize: number;
}) {
	const { tokens, maxWidth, textStyle, emojiTextures, emojiSize } = params;

	const items: { displayObject: Text | Sprite }[] = [];

	const lineHeight =
		textStyle.lineHeight ??
		CanvasTextMetrics.measureText('Mg', textStyle).height;

	let x = 0;
	let y = 0;
	let maxLineWidth = 0;

	const newLine = () => {
		maxLineWidth = Math.max(maxLineWidth, x);
		x = 0;
		y += lineHeight;
	};

	for (const token of tokens) {
		if (token.type === 'newline') {
			newLine();
			continue;
		}

		if (token.type === 'emoji') {
			const texture = emojiTextures[token.value];

			const width = emojiSize;

			if (x > 0 && x + width > maxWidth) {
				newLine();
			}

			if (texture) {
				const sprite = new Sprite(texture);
				sprite.width = emojiSize;
				sprite.height = emojiSize;
				sprite.x = x;
				sprite.y = y + (lineHeight - emojiSize) / 2;

				items.push({ displayObject: sprite });
			} else {
				const fallback = new Text({
					text: `:${token.value}:`,
					style: textStyle,
				});

				fallback.x = x;
				fallback.y = y;

				items.push({ displayObject: fallback });
			}

			x += width;
			continue;
		}

		const parts = token.value.match(/\S+|\s+/g) ?? [];

		for (const part of parts) {
			const metrics = CanvasTextMetrics.measureText(part, textStyle);
			const width = metrics.width;

			const isSpace = /^\s+$/.test(part);

			if (x > 0 && !isSpace && x + width > maxWidth) {
				newLine();

				if (isSpace) {
					continue;
				}
			}

			const textNode = new Text({
				text: part,
				style: textStyle,
			});

			textNode.x = x;
			textNode.y = y;

			items.push({ displayObject: textNode });

			x += width;
		}
	}

	maxLineWidth = Math.max(maxLineWidth, x);

	return {
		items,
		width: maxLineWidth,
		height: y + lineHeight,
	};
}