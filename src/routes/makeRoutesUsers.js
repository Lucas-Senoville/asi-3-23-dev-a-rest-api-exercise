import UserModel from "../db/models/UserModel.js"
import { InvalidAccessError, NotFoundError } from "../errors.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import { sanitizeUser } from "../sanitizers.js"
import {
  emailValidator,
  idValidator,
  nameValidator,
  queryLimitValidator,
  queryOffsetValidator,
} from "../validators.js"

const makeRoutesUsers = ({ app, db }) => {
  const checkIfUserExists = async (userId) => {
    const user = await UserModel.query().findById(userId)

    if (user) {
      return user
    }

    throw new NotFoundError()
  }

  const checkIfAdmin = async (userId) => {
    const admin = await db("roles").where({ name: "admin" })

    return admin.id === userId
  }

  app.get(
    "/users",
    auth,
    validate({
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    mw(async (req, res) => {
      const { limit, offset } = req.data.query
      const {
        session: { user: sessionUser },
      } = req

      const isAdmin = await checkIfAdmin(sessionUser.id)

      if (!isAdmin) {
        throw new InvalidAccessError()
      }

      const users = await UserModel.query()
        .withGraphFetched("roles")
        .limit(limit)
        .offset(offset)

      res.send({ result: sanitizeUser(users) })
    })
  )

  app.get(
    "/users/:userId",
    validate({
      params: { userId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const { userId } = req.data.params
      const {
        session: { user: sessionUser },
      } = req
      const user = await UserModel.query()
        .findById(userId)
        .withGraphFetched("role(sanitize, fatestFirst)")

      if (!user) {
        return
      }

      const isAdmin = await checkIfAdmin(sessionUser.id)

      if (userId !== sessionUser.id || !isAdmin) {
        throw new InvalidAccessError()
      }

      res.send({ result: sanitizeUser(user) })
    })
  )

  app.patch(
    "/users/:userId",
    auth,
    validate({
      params: { userId: idValidator.required() },
      body: {
        firstName: nameValidator,
        lastName: nameValidator,
        email: emailValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { firstName, lastName, email },
          params: { userId },
        },
        session: { user: sessionUser },
      } = req

      const isAdmin = await checkIfAdmin(sessionUser.id)

      if (userId !== sessionUser.id || !isAdmin) {
        throw new InvalidAccessError()
      }

      const user = await checkIfUserExists(userId, res)

      if (!user) {
        return
      }

      const updatedUser = await UserModel.query().updateAndFetchById(userId, {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(email ? { email } : {}),
      })

      res.send({ result: sanitizeUser(updatedUser) })
    })
  )
  app.delete(
    "/users/:userId",
    validate({
      params: { userId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const { userId } = req.data.params
      const {
        session: { user: sessionUser },
      } = req
      const user = await checkIfUserExists(userId, res)

      if (!user) {
        return
      }

      const isAmdin = await checkIfAdmin(sessionUser.id)

      if (!isAmdin) {
        throw new InvalidAccessError()
      }

      await UserModel.query().deleteById(userId)

      res.send({ result: sanitizeUser(user) })
    })
  )
}

export default makeRoutesUsers
