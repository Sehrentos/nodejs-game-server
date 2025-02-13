import m from "mithril"
import "./AccordionUI.css"

/**
 * @example m(AccordionUI, m("div", "title"), m("div", "content"))
 */
export default class AccordionUI {
    constructor(vnode) {
        this.key = vnode.attrs.key || String(performance.now()).replace(".", "-")
        this.isOpen = vnode.attrs.isOpen === true
        this._onClick = this.onClick.bind(this)
    }

    oncreate(vnode) {
        vnode.dom.addEventListener("click", this._onClick)
    }

    onremove(vnode) {
        vnode.dom.removeEventListener("click", this._onClick)
    }

    onClick(e) {
        e.stopPropagation()
        //console.log(`${this.constructor.name} ${e.type}`)
        if (e.target.closest("div.header")) {
            this.isOpen = !this.isOpen
            /*this.isOpen = e.currentTarget
              .querySelector("div.content")
              .classList.toggle("open")*/
            m.redraw()
        }
    }

    view(vnode) {
        return m("div.ui-accordion",
            m("div.header", {
                "aria-expanded": this.isOpen, // ARIA for screen readers
                "aria-controls": "accordion-content-" + this.key // Link header to content
            }, vnode.children[0]),
            this.isOpen
                ? m("div.content.open", {
                    id: "accordion-content-" + this.key
                }, vnode.children.slice(1))
                : m("div.content", {
                    id: "accordion-content-" + this.key,
                    style: "display:none;" // backup, if style is missing
                }, vnode.children.slice(1)),
        )
    }
}