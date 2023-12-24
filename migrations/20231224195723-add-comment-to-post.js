export const up = (db) => {
  db.collection('posts').updateMany({}, { $set: { comments: [] } })
}

export const down = (db) => {
  db.collection('posts').updateMany({}, { $unset: { comments: '' } })
}
