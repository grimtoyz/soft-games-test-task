import type { AvatarData, ChatData, DialogData, EmojiData } from '../types/types.ts';

export interface IMessageData {
  name: string;
  text: string;
}

export class ChatModel {
  private _messages: DialogData[];
  private _emojis: EmojiData[];
  private _avatars: AvatarData[];
  private _data: ChatData | null;

  constructor() {
    this._data = null;
    this._messages = [];
    this._emojis = [];
    this._avatars = [];
  }

  setAvatars(data: AvatarData[]): void {
    this._avatars = data;
  }

  getAvatars(): AvatarData[] {
    return this._avatars;
  }

  setEmojis(data: EmojiData[]): void {
    this._emojis = data;
  }

  getEmojis(): EmojiData[] {
    return this._emojis;
  }

  getAvatarDataByName(name: string): AvatarData | undefined {
    const avatarData: AvatarData | undefined = this._avatars.find((avatar) => {
      return avatar.name === name;
    });

    return avatarData;
  }

  setMessages(data: DialogData[]): void {
    this._messages = [...data];
  }

  getMessages(): IMessageData[] {
    return this._messages;
  }

  getMessage(index: number): string {
    const message = this._messages[index].text;

    return message;
  }

  setChatData(data: ChatData) {
    this._data = data;
  }

  getChatData(): ChatData | null {
    return this._data;
  }
}
