type TextToken = { type: 'text'; value: string };
type EmojiToken = { type: 'emoji'; value: string };
type NewLineToken = { type: 'newline' };

type Token = TextToken | EmojiToken | NewLineToken;

export function parseMessageToTokens(message: string): Token[] {
	const tokens: Token[] = [];
	const lines = message.split('\n');

	lines.forEach((line, lineIndex) => {
		const regex = /\{([a-zA-Z0-9_.-]+)\}/g;

		let lastIndex = 0;
		let match: RegExpExecArray | null;

		while ((match = regex.exec(line)) !== null) {
			const fullMatch = match[0];
			const emojiName = match[1];
			const start = match.index;

			if (start > lastIndex) {
				tokens.push({
					type: 'text',
					value: line.slice(lastIndex, start),
				});
			}

			tokens.push({
				type: 'emoji',
				value: emojiName,
			});

			lastIndex = start + fullMatch.length;
		}

		if (lastIndex < line.length) {
			tokens.push({
				type: 'text',
				value: line.slice(lastIndex),
			});
		}

		if (lineIndex < lines.length - 1) {
			tokens.push({ type: 'newline' });
		}
	});

	return tokens;
}