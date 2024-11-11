import m from "mithril"
import "./DialogUI.css"

/**
 * @class DialogUI
 * @description Dialog UI component
 * @exports DialogUI
 */
export default class DialogUI {
    /** @param {m.Vnode<{content:string|string[], isVisible?:boolean, isBackdropVisible?:boolean, isBackdropClose?:boolean}>} vnode */
    constructor(vnode) {
        /** @type {string|string[]} - dialog content */
        this.content = vnode.attrs.content || ""
        /** @type {boolean} - whether the dialog should be visible */
        this.isVisible = vnode.attrs.isVisible || false
        /** @type {boolean} - whether the backdrop should be visible */
        this.isBackdropVisible = vnode.attrs.isBackdropVisible || false
        /** @type {boolean} - close the dialog on backdrop click */
        this.isBackdropClose = vnode.attrs.isBackdropClose || false

        this._onClick = this.onClick.bind(this)
        this._onDOMDialogUpdate = this.onDOMDialogUpdate.bind(this)
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
        if (target.closest("div.ui-dialog-backdrop")) {
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

        // TODO other actions
        event.redraw = false
    }

    oncreate(vnode) {
        document.addEventListener("ui-dialog", this._onDOMDialogUpdate)
    }

    onremove(vnode) {
        document.removeEventListener("ui-dialog", this._onDOMDialogUpdate)
    }

    view(vnode) {
        if (this.isBackdropVisible) {
            return m("div.ui-dialog-backdrop", {
                class: this.isVisible ? "show" : "",
                onclick: this._onClick
            },
                m("div.ui-dialog", {
                    innerHTML: this.content,
                })
            )
        }
        return m("div.ui-dialog", {
            class: this.isVisible ? "show" : "",
            innerHTML: this.content,
            onclick: this._onClick
        })
    }

    /**
     * Updates the dialog content and displays the dialog UI.
     * 
     * @param {CustomEvent} event - The custom event containing dialog content details. 
     * 
     * @example document.dispatchEvent(new CustomEvent("ui-dialog", { detail: "Hello World" }));
     */
    onDOMDialogUpdate(event) {
        this.isVisible = true
        this.content = event.detail
        m.redraw()
    }
}