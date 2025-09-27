/**
 * @typedef {{[key:string]:(...props: UIProps)=>HTMLElement}} TagsProxy a proxy object for HTML tags
 * @typedef {Array<null|undefined|string|number|boolean|bigint|Node|Element|HTMLElement|LifecycleMethods|UIAttributes>} UIProps
 * @typedef {{[key:string]:any}} UIAttributes
 * @typedef {(event:CustomEvent<{ui: HTMLElement}>) => void} LifecycleCallback
 * @typedef {Object} LifecycleMethods
 * @prop {LifecycleCallback} oncreate a callback to be invoked when the element is created
 */

/**
 * create a proxy object for HTML tags creation
 * @example
 * import { tags } from "./UI/index.js"
 * const { div, h1, p } = tags
 * div(h1("world"), p("world"), { style: { color: 'red' } });
 *
 * @type {TagsProxy} a proxy object for HTML tags
 */
export const tags = new Proxy({}, {
	get(target, prop, receiver) {
		return (...children) => {
			if (typeof prop !== "string") {
				throw new TypeError("Property name must be a string")
			}
			return createElement(null, prop, children)
		}
	}
})

/**
 * create HTML tag with namespace URI and qualified name
 * @param {string} namespaceURI A string that specifies the `namespaceURI` to associate with the element.
 * @returns {TagsProxy} A function that creates an HTML element with the specified tag and namespace URI.
 * @example
 * const { div } = ns("http://www.w3.org/1999/xhtml")
 * @example
 * const { svg, path } = ns("http://www.w3.org/2000/svg")
 * const MyComponent = () => svg({ width: 100, height: 100 }, path({ d: "M0 0 L100 0 L100 100 L0 100 Z" }))
 */
export function ns(namespaceURI) {
	return new Proxy({}, {
		get(target, prop, receiver) {
			return (...children) => {
				if (typeof prop !== "string") {
					throw new TypeError("Property name must be a string")
				}
				return createElement(namespaceURI, prop, children)
			}
		}
	})
}

/**
 * Create an HTML element with the specified tag and append children to it.
 * @param {string|null} namespace - The namespace URI of the element to be created.
 * @param {string} tag - The type of element to be created.
 * @param {Array<any>} children - The children to append to the created element or properties.
 * @returns {Element|HTMLElement|DocumentFragment|Text} The created element with appended children.
 * @throws {TypeError} If the tag is not a string.
 */
function createElement(namespace, tag, children) {
	let element
	// find object with "is" attribute
	let elementCreateOptions = children.find(p => p != null && typeof p === "object" && p.constructor === Object && typeof p.is === "string")

	// create element
	if (namespace) {
		element = document.createElementNS(
			namespace, // e.g. "http://www.w3.org/1999/xhtml",
			tag, // e.g. "div",
			elementCreateOptions
		)
	} else if (tag === "fragment") {
		element = document.createDocumentFragment()
	} else if (tag === "text") {
		element = document.createTextNode("")
	} else {
		element = document.createElement(tag, elementCreateOptions)
	}

	// Process children or properties of an element.
	// Invoke custom `oncreate` function if provided, that is invoked before element is added into DOM.
	for (const child of children) {
		if (child == null) {
			continue;
		}
		if (typeof child === "string") {
			// when element itself is Text node
			if (element instanceof Text) {
				element.nodeValue = child
			} else {
				// add string as text node
				element.appendChild(document.createTextNode(child))
			}
		} else if (child instanceof String || typeof child === "number"
			|| typeof child === "boolean" || typeof child === "bigint") {
			// when element itself is Text node
			if (element instanceof Text) {
				element.nodeValue = String(child)
			} else {
				// add as text node
				element.appendChild(document.createTextNode(String(child)))
			}
		} else if (child instanceof Element || child instanceof DocumentFragment
			|| (typeof child === "object" && typeof child.appendChild === "function")) {
			// add as element
			element.appendChild(child)
		} else if (child.constructor === Object) {
			// merge plain objects
			merge(element, child, !!namespace)
		}
	}

	// dispatch oncreate lifecycle event
	element.dispatchEvent(new CustomEvent('create', {
		bubbles: false,
		cancelable: true,
		detail: {
			ui: element
		}
	}))

	return element
}

/**
 * util function to merge objects and apply attributes to elements
 * @param {Object} target
 * @param {Object} props
 * @param {boolean} [forceAttribute=false] optional. force attribute assignment e.g. SVG element width/height
 * @returns {Object} merged object
 */
function merge(target, props, forceAttribute = false) {
	for (const prop in props) {
		if (props.hasOwnProperty(prop)) {
			if (props[prop].constructor === Object) {
				// next-level object
				merge(target[prop], props[prop])
				continue
			}
			// element
			if (target instanceof Element
				|| target instanceof DocumentFragment
				|| (typeof target === "object" && typeof target.appendChild === "function")) {
				// custom lifecycle handling for events
				if (prop.indexOf("on") === 0) {
					// add event listener
					let type = prop.slice(2).toLowerCase()
					// add event listener
					// eg. ontouchstart: [(e) => { ... }, { passive: true }]
					if (Array.isArray(props[prop])) { // use capture
						target.addEventListener(type, props[prop][0], props[prop][1])
						continue
					}
					// normal
					target.addEventListener(type, props[prop])
					continue
				}
			}
			// attribute
			if (forceAttribute && typeof target.setAttribute === "function") {
				// force attribute assignment e.g. SVG element width/height
				target.setAttribute(prop, props[prop])
				// TODO setAttributeNS support with array of 3 parameters?
				// svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink")
			} else if (prop in target && prop !== 'style' && !prop.startsWith('data-')) {
				// Common properties: direct assignment
				target[prop] = props[prop]
			} else if (typeof target.setAttribute === "function") {
				// fallback for other attributes or style attribute
				target.setAttribute(prop, props[prop])
			} else {
				// fallback to common properties
				target[prop] = props[prop]
			}
		}
	}
	return target
}
