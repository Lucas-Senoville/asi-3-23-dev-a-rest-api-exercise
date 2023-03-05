import cors from "cors"
import express from "express"
import knex from "knex"
import morgan from "morgan"
import BaseModel from "./db/models/BaseModel.js"
import handleError from "./middlewares/handleError.js"
import makeRoutesSign from "./routes/makeRoutesSign.js"
import makeRoutesUsers from "./routes/makeRoutesUsers.js"
import makeRoutesNav from "./routes/makeRoutesNav.js";
import makeRoutesPage from "./routes/makeRoutesPage.js";

const run = async (config) => {
    const app = express()

    app.use(cors())
    app.use(express.json())
    app.use(morgan("dev"))

    const db = knex(config.db)
    BaseModel.knex(db)

    makeRoutesUsers({ app })
    makeRoutesSign({ app, db })
    makeRoutesNav({ app, db })
    makeRoutesPage({ app, db })

    app.use(handleError)
    // handling 404: keep it always LAST!
    app.use((req, res) => {
        res.status(404).send({ error: [`cannot POST ${req.url}`] })
    })

    // eslint-disable-next-line no-console
    app.listen(config.port, () => console.log(`Listening on :${config.port}`))
}

export default run