import jwt, {
  JwtHeader,
  JwtPayload,
  SigningKeyCallback,
  VerifyCallback,
} from 'jsonwebtoken'
import createJwksClient from 'jwks-rsa'

const jwksClient = createJwksClient({
  jwksUri: process.env.JWKS_URL ?? '',
})

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  jwksClient.getSigningKey(header.kid, function (err, key) {
    const signingKey = key!.getPublicKey()
    callback(err, signingKey)
  })
}

export const verifyJwt = (
  token: string,
  callback: VerifyCallback<JwtPayload | string>,
) => jwt.verify(token, getKey, {}, callback)
