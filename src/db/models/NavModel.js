import BaseModel from "./BaseModel.js";

class NavModel extends BaseModel{

    static tableName = "nav_menus"

    static get relationMappings() {
        return {}
    }
}

export default NavModel