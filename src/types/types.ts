import * as PIXI from 'pixi.js';
import type { GameScene } from '../view/scenes/GameScene.ts';
import { AVATAR_POSITIONS } from '../enums/enums.ts';
import type { Card } from '../view/components/cards/Card.ts';

export type AvatarPosition = (typeof AVATAR_POSITIONS)[keyof typeof AVATAR_POSITIONS];

export type CardFlight = {
  card: Card;
  state: { progress: number };
  timeline: GSAPTimeline;
  isComplete: boolean;
};

export type DialogData = {
  name: string;
  text: string;
};

export type EmojiData = {
  name: string;
  url: string;
};

export type AvatarData = {
  name: string;
  url: string;
  position: AvatarPosition;
};

export type ChatData = {
  dialogue: DialogData[];
  emojies: EmojiData[];
  avatars: AvatarData[];
};

export type Transition = (
  from: GameScene,
  to: GameScene,
  container: PIXI.Container,
  duration: number,
  overlay?: PIXI.Graphics
) => Promise<void>;
