import * as PIXI from 'pixi.js';

export class FPSCounter extends PIXI.Container {
  constructor(app: PIXI.Application) {
    super();

    const bg = new PIXI.Graphics()
      .roundRect(-130, -50, 260, 100, 20)
      .fill({ color: 0x1e1b22, alpha: 0.7 });

    this.addChild(bg);

    const fpsText = new PIXI.Text({
      text: 'FPS: 0',
      style: { fill: 0xffffff, fontSize: 40, align: 'center' },
    });
    fpsText.anchor.set(0.5);

    this.addChild(fpsText);

    app.ticker.add(() => {
      fpsText.text = `FPS: ${app.ticker.FPS.toFixed(1)}`;
    });
  }
}
