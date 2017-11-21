// API end point handlers and middleware for session handling
'use strict'
const uuidV4 = require('uuid/v4')
const uid = require('uid-safe')
const { reqSessionEid, findAuthorizedSession, formatMeRestore } = require('./auth')
const models = require('models')

/**
 * generate a short but statistically probably unique ID string. See http://stackoverflow.com/a/8084248
 * TODO: use thematic dictionary instead, e.g. cat breeds....
 */
function generateTracker () {
  return (Math.random() + 1).toString(36).substr(2, 5)
}

// expects to be mounted at POST '/me/restore'
// this end point will accept a missing or invalid session sid and return a new or prexisting valid one
// Attaches session name as req.logId for tracking sessions in logging
// include eid cookie value in evidence (existing or newly generated)
// NOTE: authenticated user gets added in evidence sometimes too.
function meRestoreHandler (req, res) {
  let newSid, newEid
  let eid = reqSessionEid(req) // by default we pass the eid through
  let session = findAuthorizedSession(req, models.sessions) // TODO: do we need exception handler for rate limiter reached
  if (!session) {
    newSid = true
    newEid = true
    eid = uid.sync(24) // TODO: do we really want a synchronous call here?
    session = {
      id: 's-' + uuidV4(),
      name: 's-' + generateTracker(),
      sid: uid.sync(24), // TODO: do we really want a synchronous call here?
      evidence: [Object.assign({
        ts: Date.now(),
        eid
      }, req.body)] // TODO: sanitize this
    }
    req.logId = session.name
    models.sessions.push(session)
    res.status(201)
  } else {
    req.logId = session.name
    // append changed evidence.
    // note, evidence omitted from subsequent requests do not generate a change.
    // TODO: maybe debounce or rate limit evidence changes?
    // protect against multiple simultaneous sessions (copied sid/eid, unpredictable evidence, etc.)
    // maybe limit to 6 changes per 6 hours and merge with last 6 changes
    // if limit exceeded do we silently ignore evidence or refuse to return session
    let newEvidence = Object.assign({
      eid: eid || '+' // this tests if "short life" eid cookie value has changed or is undefined
    }, req.body)
    let lastEvidence = session.evidence[session.evidence.length - 1]
    let evidence
    for (let key in newEvidence) {
      if (newEvidence[key] !== lastEvidence[key]) {
        evidence = evidence || {
          ts: Date.now(),
          eid: uid.sync(24) // TODO: do we really want a synchronous call here?
        }
        if (key !== 'eid') evidence[key] = newEvidence[key]
      }
    }
    if (evidence) {
      // TODO: debounce new eid, alleviate refresh race conditions, enable ajax login followed by refresh
      // when received previous eid, only eid is different, new eid was issued in last 30? seconds
      newEid = true
      eid = evidence.eid
      session.evidence.push(evidence)
    }
  }
  res.json(formatMeRestore(session, {
    newSid,
    newEid,
    eid,
    secure: req.body.secure // cookie SSL only determined by our caller (Nuxt UI)
  }))
}
exports.meRestoreHandler = meRestoreHandler

// expects to be mounted immediately after '/me/restore' to protect all subsequent routes
// this middleware attaches a valid session at req.session or throws an exception (status 401)
// Attaches session name as req.logId for tracking sessions in logging
function meVerifySession (req, res, next) {
  req.session = findAuthorizedSession(req, models.sessions) // TODO: do we need exception handler for rate limiter reached?
  if (!req.session) return res.status(401).end()
  req.logId = req.session.name
  next()
}
exports.meVerifySession = meVerifySession