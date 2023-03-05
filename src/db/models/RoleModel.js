import BaseModel from "./BaseModel.js";

class RoleModel extends BaseModel{

    static tableName = "roles"

    static get relationMappings() {
        return {}
        }
    }

export default RoleModel