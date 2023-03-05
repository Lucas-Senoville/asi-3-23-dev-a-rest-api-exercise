import "dotenv/config"
import { resolve } from "node:path"
import * as yup from "yup"

const validationSchema = yup.object().shape({
    port: yup.number().min(80).max(65535).required(),
    db: yup.object().shape({
        client: yup.string().oneOf(["pg"]).default("pg"),
        connection: yup.object().shape({
            database: yup.string().min(1).required(),
        }),
    }),
    security: yup.object().shape({
        session: yup.object().shape({
            jwt: yup.object().shape({
                secret: yup.string().min(30).required(),
            }),
        }),
    }),
})

let config = null

try {
    config = validationSchema.validateSync(
        {
            port: process.env.PORT,
            db: {
                client: process.env.DB_CLIENT,
                connection: {
                    user: process.env.DB_CONNECTION_USER,
                    database: process.env.DB_CONNECTION_DATABASE,
                },
                migrations: {
                    directory: resolve("./src/db/migrations"),
                    stub: resolve("./src/db/migration.stub"),
                },
            },
            security: {
                session: {
                    jwt: {
                        secret: process.env.SECURITY_SESSION_JWT_SECRET,
                        expiresIn: "1 day",
                    },
                    password: {
                        saltlen: 32,
                        iterations: 123943,
                        keylen: 256,
                        digest: "sha512",
                    },
                },
            },
            pagination: {
                limit: {
                    min: 1,
                    max: 100,
                    default: 10,
                },
            },
        },
        { abortEarly: false }
    )
} catch (err) {
    // eslint-disable-next-line no-console
    throw new Error(`Invalid config.

- ${err.errors.join("\n- ")}

`)
}

export default config