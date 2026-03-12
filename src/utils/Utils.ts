import * as PIXI from 'pixi.js';

export const Utils = {
  nextTick: (app: PIXI.Application): Promise<void> => {
    return new Promise((resolve) => {
      app.ticker.addOnce(() => resolve());
    });
  },

  lerp: (a: number, b: number, t: number): number => {
    return a + (b - a) * t;
  },

  rand: (min: number, max: number): number => {
    return min + Math.random() * (max - min);
  },

  randomFrom: <T>(arr: T[]): T => {
    return arr[(Math.random() * arr.length) | 0];
  },

  lerpColor: (a: number, b: number, t: number): number => {
    const ar = (a >> 16) & 0xff;
    const ag = (a >> 8) & 0xff;
    const ab = a & 0xff;

    const br = (b >> 16) & 0xff;
    const bg = (b >> 8) & 0xff;
    const bb = b & 0xff;

    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);

    return (rr << 16) | (rg << 8) | rb;
  },
};
