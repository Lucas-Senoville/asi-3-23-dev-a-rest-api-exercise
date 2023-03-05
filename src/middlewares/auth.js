import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"
import { InvalidSessionError } from "../errors.js"
import mw from "./mw.js"

const auth = mw(async (req, res, next) => {
    const { authorization } = req.headers

    if (!authorization) {
        throw new InvalidSessionError()
    }

    try {
        const { payload } = jsonwebtoken.verify(
            authorization.slice(7),
            config.security.session.jwt.secret
        )
        req.session = payload
    } catch (err) {
        if (err instanceof jsonwebtoken.JsonWebTokenError) {
            throw new InvalidSessionError()
        }

        throw err
    }

    next()
})

export default auth