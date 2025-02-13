import Sprite from './Sprite.js';
// import player from '../../assets/sprites/mob_2.png';

const Mob2 = new Sprite('/assets/sprites/mob_2.png', [
    [315, 300, 0, 0], // frameWidth, frameHeight, row, column
    [315, 300, 0, 1],
], { r: 255, g: 255, b: 255 })

export default Mob2
