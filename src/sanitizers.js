const extract = (keys) => {
    const subExtract = (obj) =>
        Array.isArray(obj)
            ? obj.map(subExtract)
            : keys.reduce((sanitized, key) => ({ ...sanitized, [key]: obj[key] }), {})

    return subExtract
}

export const sanitizeUser = extract([
    "id",
    "firstName",
    "lastName",
    "email",
    "pets",
])

export const sanitizePage = extract([
    "id",
    "title",
    "content",
    "urlSlug",
    "status",
    "creatorId"
])

export const sanitizeNav = extract([
    "id",
    "name",
    "pages_list"
])