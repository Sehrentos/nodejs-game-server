import { Entity as EntityModel } from "../../src/model/Entity.js"

export default class Entity extends EntityModel {
	constructor(p) {
		super(p)
		// TODO get real size
		this.width = 32
		this.height = 32
	}
}