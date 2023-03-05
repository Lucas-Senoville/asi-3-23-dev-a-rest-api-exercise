import { AppError } from "../errors.js"

// eslint-disable-next-line no-unused-vars
const handleError = (err, req, res, next) => {
    if (!(err instanceof AppError)) {
        // eslint-disable-next-line no-console
        console.error(err)

        res.send({ error: ["Oops. Something went wrong."], errorCode: "error" })

        return
    }

    res.status(err.httpCode).send({ error: err.errors, errorCode: err.errorCode })
}

export default handleError