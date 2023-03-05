export const up = async (knex) => {
    await knex.schema.createTable("users", (table) => {
        table.increments("id")
        table.text("firstName").notNullable()
        table.text("lastName").notNullable()
        table.text("email").notNullable().unique()
        table.text("passwordHash")
        table.text("passwordSalt")
    })

    await knex.schema.createTable("roles", (table) => {
        table.increments("id")
        table.text("name").notNullable()
    })
}

export const down = async (knex) => {
    await knex.schema.dropTable("users")
    await knex.schema.dropTable("roles")
}