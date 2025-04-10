import m from "mithril"
import "./DialogUI.css"

/**
 * @typedef {Object} TDialogUIProps
 * @prop {any=} content
 * @prop {boolean=} isVisible
 * @prop {boolean=} isBackdropVisible
 * @prop {boolean=} isBackdropClose
 */

/**
 * @class DialogUI
 * @description The Dialog UI component
 * @exports DialogUI
 */
export default class DialogUI {
    /** @param {m.Vnode<TDialogUIProps>} vnode */
    constructor(vnode) {
        /** @type {any} - dialog content */
        this.content = vnode.attrs.content || ""
        /** @type {boolean} - whether the dialog should be visible */
        this.isVisible = vnode.attrs.isVisible || false
        /** @type {boolean} - whether the backdrop should be visible */
        this.isBackdropVisible = vnode.attrs.isBackdropVisible || false
        /** @type {boolean} - close the dialog on backdrop click */
        this.isBackdropClose = vnode.attrs.isBackdropClose || false

        this._onClick = this.onClick.bind(this)
    }

    onClick(event) {
        /** @type {HTMLElement|null} - element where the event occurred */
        const target = event.target
        if (!target) {
            event.redraw = false
            return
        }

        /** @type {HTMLDivElement|null} - element where the event is attached to */
        const currentTarget = event.currentTarget
        if (!currentTarget) {
            event.redraw = false
            return
        }

        // the backdrop is clicked
        if (this.isBackdropClose && target.closest("div.ui-dialog-backdrop")) {
            // hide the UI
            this.isVisible = false
            return
        }

        // find the close button
        const closeButton = target.closest(".ui-dialog-close")
        if (closeButton) {
            this.isVisible = false
            return
        }

        // other actions
        event.redraw = false
    }

    view(vnode) {
        if (this.isBackdropVisible) {
            return m("div.ui-dialog-backdrop", {
                class: this.isVisible ? "show" : "",
                onclick: this._onClick
            },
                m("div.ui-dialog", typeof this.content === "string" ? m.trust(this.content) : this.content)
            )
        }
        return m("div.ui-dialog", {
            class: this.isVisible ? "show" : "",
            onclick: this._onClick
        }, typeof this.content === "string" ? m.trust(this.content) : this.content)
    }
}