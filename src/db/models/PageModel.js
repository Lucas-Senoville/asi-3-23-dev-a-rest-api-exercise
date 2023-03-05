import BaseModel from "./BaseModel.js"
import UserModel from "./UserModel.js";

class PageModel extends BaseModel {
    static tableName = "users"

    static get relationMappings() {
        return {
            creator: {
                modelClass: UserModel,
                relation: BaseModel.BelongsToOneRelation,
                join: {
                    from: "pages.creatorId",
                    to: "users.id",
                },
            },
        }
    }
}

export default PageModel