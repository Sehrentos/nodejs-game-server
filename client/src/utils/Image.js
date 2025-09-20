// Image utilities

/** @type {HTMLCanvasElement} */
let canvasCache;
/** @type {CanvasRenderingContext2D} */
let ctxCache;

/**
 * Helper to convert image color to transparent e.g. purple (255,0,255).
 *
 * It uses a cached canvas and context to improve performance when called multiple times.
 * It will modify the original image source eg. `img.src` value.
 *
 * @param {HTMLImageElement} img
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 */
export function addImageTransparency(img, red = 255, green = 0, blue = 255) {
	const canvas = canvasCache || document.createElement('canvas')
	canvas.width = img.width || img.clientWidth
	canvas.height = img.height || img.clientHeight
	const ctx = ctxCache || canvas.getContext('2d', { willReadFrequently: true })
	ctx.drawImage(img, 0, 0);
	let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	// iterate over all pixels
	// in the image data and turn specific pixels to transparent
	let n = imgData.data.length;
	for (let i = 0; i < n; i += 4) {
		// with some tolerance
		// if(imgData.data[i] >= red  && imgData.data[i + 1] < green && imgData.data[i + 2] >= blue)
		// exact color match
		if (imgData.data[i] === red && imgData.data[i + 1] === green && imgData.data[i + 2] === blue) {
			imgData.data[i + 3] = 0; // Set alpha channel to 0 for transparency
		}
	}
	ctx.putImageData(imgData, 0, 0);
	// replace the existing source image with the new one
	img.src = canvas.toDataURL();
}
