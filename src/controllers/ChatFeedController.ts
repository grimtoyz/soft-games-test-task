import { ChatFeed } from '../view/components/chat/ChatFeed';
import { ChatModel } from '../models/ChatModel';

interface IMessageData {
  name: string;
  text: string;
}

export class ChatFeedController {
  private _view: ChatFeed;
  private _messagesToShow: IMessageData[];
  readonly _chatModel: ChatModel;

  constructor(view: ChatFeed, chatModel: ChatModel) {
    this._view = view;
    this._chatModel = chatModel;
    this._messagesToShow = [];
  }

  public async startDialogue(): Promise<void> {
    this._messagesToShow = [...this._chatModel.getMessages()];

    while (this._messagesToShow.length) {
      const message = this._messagesToShow.shift();
      if (!message) {
        throw new Error('message not found');
      }
      await this.showMessage(message);
    }
  }

  public resetDialogue(): void {
    this._messagesToShow = [];
    this._view.reset();
  }

  private async showMessage(message: IMessageData): Promise<void> {
    const avatarData = this._chatModel.getAvatarDataByName(message.name);
    // if (!avatarData) {
    //   throw new Error('no avatarData found');
    // }
    this._view.addMessage(message, avatarData);
    await this._view.scroll();
  }

  public async updateOnResize(isPortrait: boolean): Promise<void> {
    this._view.onResize(isPortrait);
    this._view.updateMaxWidth(isPortrait);
    this._view.updateMask(isPortrait);

    this._view.updateFeedPosition(isPortrait, true);
  }
}
