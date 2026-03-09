export const ASSET_BUNDLES = {
	ui: {
		button: '/assets/ui/ui.json',
	},

	backgrounds: {
		green_bg: '/assets/backgrounds/green_bg_square.jpg',
		brown_bg: '/assets/backgrounds/brown_bg.jpg',
		phone_bg_land: '/assets/backgrounds/smartphone_bg_land.png',
		phone_bg_port: '/assets/backgrounds/smartphone_bg_port.png'
	},

	debug: {
		safe_frame: '/assets/debug/safe_frame.png'
	},

	game: {
		cards_deck: '/assets/cards/cards.json',
		fire: '/assets/fire/fire.json',
		chat_bubble: '/assets/chat/chat_bubble_nineslice.png'
	}
} as const;