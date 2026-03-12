import * as PIXI from 'pixi.js';
import type { GameScene } from '../view/scenes/GameScene.ts';

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
  position: 'left' | 'right';
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
