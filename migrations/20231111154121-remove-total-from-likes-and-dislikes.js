export const up = async (db, client) => {
  const session = client.startSession()

  session.withTransaction(async () => {
    await db
      .collection('posts')
      .updateMany({}, [
        { $set: { likes: '$likes.users', dislikes: '$dislikes.users' } },
      ])
  })
}

export const down = async (db, client) => {
  const session = client.startSession()

  session.withTransaction(async () => {
    await db
      .collection('posts')
      .updateMany({}, [
        { $set: { likes: '$likes.users', dislikes: '$dislikes.users' } },
      ])
  })
}
