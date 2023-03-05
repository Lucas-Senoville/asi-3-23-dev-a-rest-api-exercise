export const up = async (knex) => {
    await knex.schema.alterTable("roles", (table) => {
        table.text("permissions").notNullable()
    })
}

export const down = async (knex) => {
    await knex.schema.alterTable("roles", (table) => {
        table.dropColumns("permissions")
    })
}