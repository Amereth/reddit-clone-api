export const up = async (db, client) => {
  const session = client.startSession()

  session.withTransaction(() => {
    db.collection('posts').updateMany({}, [
      { $set: { likes: { $size: '$likes' } } },

      { $set: { dislikes: { $size: '$dislikes' } } },
    ])
  })
}
