export const up = async (knex) => {
  await knex.schema.createTable("pages", (table) => {
    table.increments("id")
    table.text("title").notNullable()
    table.text("content").notNullable()
    table.text("urlSlug").notNullable().unique()
    table.text("publishedTimestamp")
    table.text("status").notNullable()
    table.integer("creatorId").notNullable().references("id").inTable("users")
    table.specificType("contributors", "integer ARRAY")
  });
};

export const down = async (knex) => {
    await knex.schema.dropTable("pages")
};
