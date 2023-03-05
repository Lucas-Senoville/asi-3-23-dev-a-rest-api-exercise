import * as yup from "yup"
import config from "./config.js"

export const nameValidator = yup
    .string()
    .matches(/^[\p{L} -]+$/u, "Name is invalid")
    .label("Name")

export const firstNameValidator = nameValidator.label("First name")

export const lastNameValidator = nameValidator.label("Last name")

export const emailValidator = yup.string().email().label("E-mail")

export const idValidator = yup
    .number()
    .integer()
    .min(1)
    .label("ID")
    .typeError("Invalid ID")

export const passwordValidator = yup
    .string()
    .matches(
        /^(?=.*[^\p{L}0-9])(?=.*[0-9])(?=.*\p{Lu})(?=.*\p{Ll}).{8,}$/u,
        "Password must be at least 8 chars & contain at least one of each: lower case, upper case, digit, special char."
    )
    .label("Password")

export const contentValidator = yup
    .string()
    .min(1)
    .typeError("Invalid content")

export const urlSlugValidator = yup
        .string()
        .matches(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/g
        )
        .label("URL Slug")

export const queryLimitValidator = yup
    .number()
    .integer()
    .min(config.pagination.limit.min)
    .default(config.pagination.limit.default)
    .label("Query Limit")

export const queryOffsetValidator = yup
    .number()
    .integer()
    .min(0)
    .label("Query Offset")