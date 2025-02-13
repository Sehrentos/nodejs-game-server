import m from "mithril"
import "./TabsUI.css"

/**
 * @typedef {Object} TTab
 * @prop {string} name
 * @prop {any} content
 * @prop {boolean} active
 */

/**
 * @class TabsUI
 * @description Tabs UI component
 * @exports TabsUI
 * 
 * @example m(TabsUI, {
 *   tabs: [{
 *     name: "Tab1", active: true, content: "add content, Nodes etc.",
 *     name: "Tab2", active: false, content: "add content, Nodes etc.",
 *   })
 * )
 */
export default class TabsUI {
    /** @param {m.Vnode<{tabs:TTab[]}>} vnode */
    constructor(vnode) {
        this.tabs = vnode.attrs.tabs
        this._onClick = this.onClick.bind(this)
    }

    // #region mithril events
    oncreate(vnode) {
        vnode.dom.addEventListener("click", this._onClick)
    }

    onremove(vnode) {
        vnode.dom.removeEventListener("click", this._onClick)
    }

    view(vnode) {
        return m("div.ui-tabs",
            /** create tab & tablinks */
            m("div.tab",
                this.tabs.map((tab, index) => m("div", {
                    key: index,
                    "data-index": index,
                    "data-tabcontent": `tabcontent-${index}`,
                    class: tab.active ? "tablink active" : "tablink",
                }, tab.name))
            ),
            /** create tabcontent */
            this.tabs.map((tab, index) => m("div", {
                key: index,
                "data-index": index,
                id: `tabcontent-${index}`,
                class: tab.active ? "tabcontent active" : "tabcontent",
            }, tab.content))
        )
    }
    // #endregion mithril events

    onClick(event) {
        event.preventDefault()
        event.stopPropagation()

        /** @type {HTMLElement|null} */
        const target = event.target
        if (!target) return false

        // /** @type {HTMLElement|null} */
        // const currentTarget = event.currentTarget
        // if (!currentTarget) return false

        const targetTablink = target.closest("div.tablink")
        if (!targetTablink) return false

        // const targetTabContent = currentTarget.querySelector("#" + targetTablink.getAttribute("data-tabcontent"))
        // if (!targetTabContent) return false

        // const tablinks = currentTarget.getElementsByClassName("tablink")
        // if (!tablinks.length) return false

        // const tabcontent = currentTarget.getElementsByClassName("tabcontent")
        // if (!tabcontent.length) return false

        // // Get all elements with class="tablinks" and remove the class "active"
        // for (let i = 0; i < tablinks.length; i++) {
        //     tablinks[i].classList.remove("active")
        // }

        // // Get all elements with class="tabcontent" and remove the class "active"
        // for (let i = 0; i < tabcontent.length; i++) {
        //     tabcontent[i].classList.remove("active")
        // }

        // // Show the current tab, and add an "active" class
        // targetTablink.classList.add("active")
        // targetTabContent.classList.add("active")

        const index = targetTablink.getAttribute("data-index")
        if (!index) return false

        const tab = this.tabs[index]
        if (!tab) return false

        this.tabs.forEach(t => t.active = false)
        tab.active = true

        m.redraw()
    }

}

/* Example usage
m(TabsUI, {
    tabs: [
        {
            name: "Stats",
            content: m("div.stats", [
                m("strong", "Str"),
                m("span", State.player.str || "1"),
                m("strong", "Agi"),
                m("span", State.player.agi || "1"),
                m("strong", "Int"),
                m("span", State.player.int || "1"),
                m("strong", "Vit"),
                m("span", State.player.vit || "1"),
                m("strong", "Dex"),
                m("span", State.player.dex || "1"),
                m("strong", "Luk"),
                m("span", State.player.luk || "1"),
            ]),
            active: true,
        },
    ],
})
*/