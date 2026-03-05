import { Game } from "./game";

const game = new Game();
await game.init();

// game.app.ticker.add((ticker) => {
// 	const dt = ticker.deltaMS / 1000;
// 	label.rotation += dt * 0.5;
// });