import Sprite from './Sprite.js';
// import player from '../../assets/sprites/mob_8.png';

const Mob8 = new Sprite('/assets/sprites/mob_8.png', [
    [300, 300, 0, 0], // frameWidth, frameHeight, row, column
    [300, 300, 0, 1],
], { r: 255, g: 255, b: 255 })

export default Mob8
