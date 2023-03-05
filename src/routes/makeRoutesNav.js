import UserModel from "../db/models/UserModel.js"
import { InvalidAccessError, NotFoundError } from "../errors.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import { sanitizeNav } from "../sanitizers.js"
import { idValidator, nameValidator } from "../validators.js"
import NavModel from "../db/models/NavModel.js"

const makeRoutesNav = ({ app, db }) => {
  const checkIfNavExists = async (navId) => {
    const nav = await db("nav_menus").query().findById(navId)

    if (nav) {
      return nav
    }

    throw new NotFoundError()
  }

  const checkIfAdminOrManager = async (userId) => {
    const admin = await db("roles").where({ name: "admin" })
    const manager = await db("roles").where({ name: "admin" })

    return admin.id === userId || manager.id === userId
  }

  app.post(
    "/create-nav",
    validate({
      body: {
        name: nameValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const { name, pages_list } = req.data.body
      const {
        session: { user: sessionUser },
      } = req
      const allowed = await checkIfAdminOrManager(sessionUser.id)

      if (!allowed) {
        throw new InvalidAccessError()
      }

      const [nav] = await db("nav_menus")
        .insert({
          name,
          pages_list,
        })
        .returning("*")

      res.send({ result: sanitizeNav(nav) })
    })
  )

  app.get(
    "/navs/:navId",
    validate({
      params: { navId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const { navId } = req.data.params
      const nav = await NavModel.query().findById(navId)

      if (!nav) {
        return
      }

      res.send({ result: sanitizeNav(nav) })
    })
  )

  app.patch(
    "/navs/:navId",
    auth,
    mw(async (req, res) => {
      const {
        data: {
          body: { name, pages_list },
          params: { navId },
        },
        session: { user: sessionUser },
      } = req

      const allowed = await checkIfAdminOrManager(sessionUser.id)

      if (!allowed) {
        throw new InvalidAccessError()
      }

      const nav = await checkIfNavExists(navId, res)

      if (!nav) {
        return
      }

      const updatedNav = await UserModel.query().updateAndFetchById(navId, {
        ...(name ? { name } : {}),
        ...(pages_list ? { pages_list } : {}),
      })

      res.send({ result: sanitizeNav(updatedNav) })
    })
  )
  app.delete(
    "/navs/:navId",
    validate({
      params: { navId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const { navId } = req.data.params
      const {
        session: { user: sessionUser },
      } = req
      const nav = await checkIfNavExists(navId, res)

      if (!nav) {
        return
      }

      const allowed = await checkIfAdminOrManager(sessionUser.id)

      if (!allowed) {
        throw new InvalidAccessError()
      }

      await NavModel.query().deleteById(navId)

      res.send({ result: sanitizeNav(nav) })
    })
  )
}

export default makeRoutesNav
