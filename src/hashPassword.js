import { pbkdf2Sync, randomBytes } from "node:crypto"
import config from "./config.js"

const security = config.security.session.password

const hashPassword = (
    passsword,
    salt = randomBytes(security.saltlen).toString("hex")
) => [
    pbkdf2Sync(
        passsword,
        salt,
        security.iterations,
        security.keylen,
        security.digest
    ).toString("hex"),
    salt,
]

export default hashPassword