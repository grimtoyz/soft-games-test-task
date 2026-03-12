export const ASSET_BUNDLES = {
  ui: {
    ui: '/assets/ui/ui.json',
  },

  backgrounds: {
    green_bg: '/assets/backgrounds/green_bg_square.jpg',
    brown_bg: '/assets/backgrounds/brown_bg.jpg',
    phone_bg_land: '/assets/backgrounds/smartphone_bg_land.jpg',
    phone_bg_port: '/assets/backgrounds/smartphone_bg_port.jpg',
  },

  debug: {
    safe_frame: '/assets/debug/safe_frame.png',
  },

  game: {
    cards_deck: '/assets/cards/cards.json',
    fire: '/assets/fire/fire.json',
  },
} as const;
