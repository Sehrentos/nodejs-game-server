/**
 * @typedef {Object} TLocale
 * @prop {string} version
 * @prop {string} lang
 * @prop {string} langName
 */

/**
 * Supported languages
 */
const languages = {
	en: () => import('./en.json'),
	fi: () => import('./fi.json')
};

/**
 * Current language
 * @type {string}
 */
let currentLanguage = localStorage.getItem('language') || 'en';

/**
 * Load a locale
 * @param {string} language
 * @returns {Promise<TLocale>}
 */
const loadLocale = async language => {
	const locale = await languages[language]().then(m => m.default);
	currentLanguage = language;
	localStorage.setItem('language', language);
	return locale;
};

/**
 * Get the current locale
 * @returns {Promise<TLocale>}
 */
export const getLocale = () => loadLocale(currentLanguage);

/**
 * Set the current locale
 * @param {string} language
 * @returns {Promise<TLocale>}
 */
export const setLocale = language => loadLocale(language);

// example use case:
// (async () => {
// 	const locale = await getLocale();
// 	const ver = locale.version;
// 	console.log('locale test:', ver);
// })()

// import { getLocale } from "./locale/locale.js"
// // initialize by loading locale first
// try {
// 	const locale = await getLocale()
// 	document.documentElement.lang = locale.lang
// 	// ...your code...
// } catch (error) {
// 	console.error(error)
// 	document.body.textContent = "Error: " + error
// }
