export const up = async (db, client) => {
  await db
    .collection('posts')
    .updateMany({}, { $set: { likes: 0, dislikes: 0 } })
}

export const down = async (db, client) => {
  await db
    .collection('posts')
    .updateMany({}, { $unset: { likes: '', dislikes: '' } })
}
