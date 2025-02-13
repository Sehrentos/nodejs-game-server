import Sprite from './Sprite.js';
// import player from '../../assets/sprites/mob_4.png';

const Mob4 = new Sprite('/assets/sprites/mob_4.png', [
    [400, 300, 0, 0], // frameWidth, frameHeight, row, column
    [400, 300, 0, 1],
], { r: 255, g: 255, b: 255 })

export default Mob4
