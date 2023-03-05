export const up = async (knex) => {
    await knex.schema.alterTable("users", (table) => {
        table.integer("roleId")
            .notNullable()
            .references("id")
            .inTable("roles")
    })
}

export const down = async (knex) => {
    await knex.schema.alterTable("users", (table) => {
        table.dropColumns("roleId")
    })
}