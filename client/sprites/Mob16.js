import Sprite from './Sprite.js';
// import player from '../../assets/sprites/mob_16.png';

const Mob16 = new Sprite('/assets/sprites/mob_16.png', [
    [306, 300, 0, 0], // frameWidth, frameHeight, row, column
    [306, 300, 0, 1], // back
    [306, 300, 0, 2], // left
    [306, 300, 0, 3], // right
], { r: 255, g: 255, b: 255 })

export default Mob16
