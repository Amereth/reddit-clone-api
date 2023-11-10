export const up = async (db, client) => {
  const session = client.startSession()

  session.withTransaction(async () => {
    await db
      .collection('posts')
      .updateMany({}, [
        { $set: { temp_likes: '$likes', temp_dislikes: '$dislikes' } },
      ])

    await db.collection('posts').updateMany({}, [
      {
        $set: {
          likes: { total: '$temp_likes', users: [] },
          dislikes: { total: '$temp_dislikes', users: [] },
        },
      },
    ])

    await db
      .collection('posts')
      .updateMany({}, { $unset: { temp_likes: '', temp_dislikes: '' } })
  })
}

export const down = async (db, client) => {
  const session = client.startSession()

  session.withTransaction(async () => {
    await db.collection('posts').updateMany({}, [
      {
        $set: {
          temp_likes: '$likes.total',
          temp_dislikes: '$dislikes.total',
        },
      },
    ])

    await db
      .collection('posts')
      .updateMany({}, { $unset: { likes: '', dislikes: '' } })

    await db
      .collection('posts')
      .updateMany(
        {},
        { $rename: { temp_likes: 'likes', temp_dislikes: 'dislikes' } },
      )
  })
}
