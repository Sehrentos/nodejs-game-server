import Sprite from './Sprite.js';
// import player from '../../assets/sprites/player_1.png'; // option 1: use webpack to import assets

// option 2: use static /assets path
// 2020x966
const Player1 = new Sprite('/assets/sprites/player_1.png', [
    [665, 966, 0, 0], // frameWidth, frameHeight, row, column
    [665, 966, 0, 1], // back
    [655, 966, 0, 2], // left
    [655, 966, 0, 3], // right
], { r: 255, g: 255, b: 255 })

export default Player1
