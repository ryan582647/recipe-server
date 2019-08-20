const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const jwtdecode = require('jwt-decode')

const AuthService = {
    getUserWithUserName(db, username) {
        return db('users')
               .where({ username })
               .first()
    },

    comparePasswords(password, hash) {
        return bcrypt.compare(password, hash)
    },

    createJwt(subject, payload) {
        return jwt.sign(payload, config.JWT_SECRET, {
            subject,
            algorithm: 'HS256'
        })
    },
    verifyJwt(token) {
        return jwt.verify(token, config.JWT_SECRET, {
            algorithms: ['HS256'],
        })
    },
    parseBasicToken(token) {
        return Buffer
        .from(token, 'base64')
        .toString()
        .split(':')
    },
    extractToken (req) { 
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') 
        { return req.headers.authorization.split(' ')[1]; } 
        
        else if (req.query && req.query.token) { return req.query.token; } return null; },

    parseJWTToken(token) {
            return jwtdecode(token);
        }

}


module.exports = AuthService