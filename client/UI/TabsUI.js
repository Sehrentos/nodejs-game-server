import m from "mithril"
import "./TabsUI.css"

/**
 * @class TabsUI
 * @description Tabs UI component
 * @exports TabsUI
 * 
 * @example m(TabsUI,
 *   m(".tab",
 *     m(".tablink.active", "Tab 1"),
 *     m(".tablink", "Tab 2"),
 *   ),
 *   m(".tabcontent.active", m(".stats", "My tab content 1")),
 *   m(".tabcontent", m(".stats", "My tab content 2")),
 * )
 */
export default class TabsUI {
    /** @param {m.Vnode<any>} vnode */
    constructor(vnode) {
        // this.activeTab = vnode.attrs.activeTab || 0
        this._onClick = this.onClick.bind(this)
    }

    // #region mithril events

    /** @param {m.VnodeDOM} vnode */
    oncreate(vnode) {
        vnode.dom.addEventListener("click", this._onClick)
    }

    /** @param {m.VnodeDOM} vnode */
    onremove(vnode) {
        vnode.dom.removeEventListener("click", this._onClick)
    }

    /** @param {m.Vnode<any>} vnode */
    view(vnode) {
        return m("div.ui-tabs", vnode.children)
    }

    // #endregion mithril events

    /** @param {Event} event */
    onClick(event) {
        // event.preventDefault()
        // event.stopPropagation()

        /** @type {HTMLElement|null} */
        // @ts-ignore has null check
        const target = event.target
        if (!target) return false

        /** @type {HTMLElement|null} */
        // @ts-ignore has null check
        const currentTarget = event.currentTarget
        if (!currentTarget) return false

        // was tablink clicked
        const targetTablink = target.closest(".tablink")
        if (!targetTablink) return false

        const tablinks = currentTarget.querySelectorAll(".tablink")
        if (!tablinks.length) return false

        const indexOfTablink = Array.prototype.indexOf.call(tablinks, targetTablink)
        if (indexOfTablink === -1) return false

        const tabContents = currentTarget.querySelectorAll(".tabcontent")
        if (!tabContents.length) return false

        const targetTabContent = tabContents[indexOfTablink]
        if (!targetTabContent) return false

        // Get all elements with class="tablinks" and remove the class "active"
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active")
        }

        // Get all elements with class="tabcontent" and remove the class "active"
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].classList.remove("active")
        }

        // Show the current tab, and add an "active" class
        targetTablink.classList.add("active")
        targetTabContent.classList.add("active")

        // if you notice UI update issues, uncomment this
        // m.redraw()
    }
}
