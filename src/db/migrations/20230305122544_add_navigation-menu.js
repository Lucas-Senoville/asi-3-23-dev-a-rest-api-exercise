export const up = async (knex) => {
    await knex.schema.createTable("nav_menus", (table) => {
        table.increments("id")
        table.text("name")
        table.jsonb("pages_list")
    })
}

export const down = async (knex) => {
    await knex.schema.dropTable("nav_menus")
}