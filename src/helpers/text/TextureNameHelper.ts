export function getEmojiTextureName(emojiName: string): string {
	return `emojies-${emojiName}`;
}

export function getAvatarTextureName(avatarName: string): string {
	return `avatars-${avatarName.toLowerCase()}`;
}