import BaseModel from "./BaseModel.js"
import RoleModel from "./RoleModel.js"

class UserModel extends BaseModel {
    static tableName = "users"

    static get relationMappings() {
        return {
            role: {
                modelClass: RoleModel,
                relation: BaseModel.BelongsToOneRelation,
                join: {
                    from: "users.roleId",
                    to: "roles.id",
                },
            },
        }
    }
}

export default UserModel