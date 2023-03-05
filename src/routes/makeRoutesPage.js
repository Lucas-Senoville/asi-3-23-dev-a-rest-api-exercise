import { InvalidAccessError, NotFoundError } from "../errors.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import { sanitizePage, sanitizeUser } from "../sanitizers.js"
import {
  contentValidator,
  idValidator,
  nameValidator,
  queryLimitValidator,
  queryOffsetValidator,
  urlSlugValidator,
} from "../validators.js"
import PageModel from "../db/models/PageModel.js"

const makeRoutesPage = ({ app, db }) => {
  const checkIfPageExists = async (pageId) => {
    const page = await PageModel.query().findById(pageId)

    if (page) {
      return page
    }

    throw new NotFoundError()
  }

  const checkIfAdminOrManager = async (userId) => {
    const admin = await db("roles").where({ name: "admin" })
    const manager = await db("roles").where({ name: "admin" })

    return admin.id === userId || manager.id === userId
  }

  app.post(
    "/create-page",
    validate({
      body: {
        title: nameValidator.required(),
        content: contentValidator.required(),
        urlSlug: urlSlugValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const { title, content, urlSlug } = req.data.body
      const {
        session: { user: sessionUser },
      } = req
      const allowed = await checkIfAdminOrManager(sessionUser.id)
      const creatorId = sessionUser.id
      const contributors = [creatorId]
      const status = "drafted"

      if (!allowed) {
        throw new InvalidAccessError()
      }

      const [page] = await db("pages")
        .insert({
          title,
          content,
          urlSlug,
          creatorId,
          contributors,
          status,
        })
        .returning("*")

      res.send({ result: sanitizePage(page) })
    })
  )

  app.get(
    "/pages/all",
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
      let pages = null

      if (sessionUser) {
        pages = await PageModel.query()
          .where({ status: "drafted" })
          .andWhere({ creatorId: sessionUser.id })
          .withGraphFetched("creator")
          .limit(limit)
          .offset(offset)
      } else {
        pages = await PageModel.query()
          .where({ status: "published" })
          .withGraphFetched("creator")
          .limit(limit)
          .offset(offset)
      }

      res.send({ result: sanitizePage(pages) })
    })
  )

  app.get(
    "/pages/:pageId",
    validate({
      params: { pageId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const { pageId } = req.data.params
      const {
        session: { user: sessionUser },
      } = req

      const page = await PageModel.query()
        .where({ creatorId: sessionUser.id })
        .findById(pageId)
        .withGraphFetched("creator")

      if (!page) {
        return
      }

      res.send({ result: sanitizePage(page) })
    })
  )

  app.patch(
    "/pages/:pageid",
    auth,
    validate({
      params: { pageId: idValidator.required() },
      body: {
        title: nameValidator,
        content: contentValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { title, content },
          params: { pageId },
        },
        session: { user: sessionUser },
      } = req

      const page = await checkIfPageExists(pageId, res)

      if (!page) {
        return
      }

      const allowed = await checkIfAdminOrManager(sessionUser.id)

      if (!allowed) {
        throw new InvalidAccessError()
      }

      const updatedPage = await PageModel.query().updateAndFetchById(pageId, {
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
      })

      res.send({ result: sanitizeUser(updatedPage) })
    })
  )
  app.delete(
    "/pages/:pageId",
    validate({
      params: { pageId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const {
        session: { user: sessionUser },
      } = req
      const { pageId } = req.data.params
      const page = await checkIfPageExists(pageId, res)

      if (!page) {
        return
      }

      const allowed = await checkIfAdminOrManager(sessionUser.id)

      if (!allowed) {
        throw new InvalidAccessError()
      }

      await PageModel.query().deleteById(pageId)

      res.send({ result: sanitizeUser(page) })
    })
  )
}

export default makeRoutesPage
