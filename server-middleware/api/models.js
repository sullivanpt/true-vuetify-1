// API model stubs for sample data
'use strict'

/**
 * private verified person identity tied to a collection of sessions (aka members)
 * includes admins, system, robots, persons, etc.
 */
let users = [
  { id: 'u1', name: 'u1-name', seen: 0, salt: 'u1-salt', hash: 'u1-hash' }, // see https://www.npmjs.com/package/pbkdf2-password
  {
    id: 'u2',
    // TODO: if this user name is public we'll need a profanity filter, and/or not reviewed yet delay
    // TODO: need mechanism to hide a profane name detected after the fact, without changing the login name the user knows
    // TODO: need a history of all past names to show in public user details
    name: 'u2-name',
    session: 's2', // most recently associated session or falsey if purposely logged out (primarily catches multiple session login)
    seen: 123456, // timestamp of last message seen (optimize login search)
    channels: [
      { device: 'phone-abc', events: [ 'password', 'mentions' ] },
      { email: 'u2@mail.com', verified: 123456 }
    ]
  },
  { id: 'u3', name: 'u3-name', seen: 0, disabled: 'forget' }
]
exports.users = users

/**
 * linked to browser cookie (aka trackers)
 *
 * tracks activity metrics, emotional feedback, etc.
 * can be associated with mutiple users, e.g. public terminal.
 *
 * TODO: invert this into more traditional sessions based on short life key and 'clients' based
 * on long life key. client keeps settings, active login, logging/identity name.  session keeps
 * shareded arrays that grow unbounded. better performance, access to traditional auth libraries
 * like passport, ability to use non-cookie trackers as primary client matcher, and not too much
 * more complex. However, the primary difficulty is it would require updating client cookies on
 * login/logout, which would require a full page client refresh with a synchronization token.
 */
let sessions = [
  { id: 's1', sk: 's1-sk', name: 's1-name', seen: 0, logins: [], evidence: [{ ts: 123456, ek: 's1-ek1', ipAddress: '1.2.3.4' }], activity: [] },
  {
    id: 's2', // the public key for read access to the session
    sk: 's2-sk', // controls update access and must only be shared with the session owner
    name: 's2-name', // the public display name of the session
    tags: ['robot', 'system'], // both permission group and a public classification
    seen: 123456, // timestamp of last message seen (optimize login search)
    settings: {
      cookies: true // user has accepted the cookie policy
    },
    logins: [ // most recently associated user
      { ts: 123456, ek: 's2-ek2', user: 'u2' }, // login as u1 (tied to ek)
      { ts: 123466, user: 'u2' }, // lock (no-ek)
      { ts: 123476 }, // logout (no user)
      { ts: 133456, ek: 's2-ek3', user: 'u1' } // login as u2, eventually expired
    ],
    evidence: [{ ts: 123456, ek: 's1-ek1', ipAddress: '1.2.3.4' }], // private time ordered list of unique user agent properties, ek regenerated on change
    activity: [{ ts: 123456, action: 'rate', value: 5 }] // private time ordered list of metrics about this session, usually user actions
  },
  { id: 's3', sk: 's3-sk', name: 's3-name', seen: 0, logins: [], evidence: [], activity: [] }
]
exports.sessions = sessions

/**
 * private messages between sessions (or assoc user)
 * - help and alerts to and from community admin to session (or associated user)
 * - session (or assoc user) to session (or assoc user) private data reveal for IRL meetup
 * individual read/reply, but group send targeting for system alerts/tos changes/etc.
 */
let messages = [
  { ts: Date.now(), id: 'm1', text: 'm1-text', fromSession: 's2', toUser: 'u1' },
  {
    ts: 123456,
    expires: 123456789, // null or when this message becomes "removed"
    id: 'm2',
    title: 'm2-title',
    text: 'descriptive text', // markdown
    fromSession: 's2', // maybe fromUser?
    toSessions: 'all' // one of: toSession, toSessions, toUser, toTag
  }
]
exports.messages = messages

/**
 * unverified person identity tied to a collection of sessions
 * - sessions can be in multiple auras with differing probabilities
 * - created by evidence algorithms
 * -- known user login (100% probability, only reduced by fraud)
 * -- known user claims sessions retroactively (typically not 100%)
 * -- evidence matching like IP or geo or biometrics
 */
let auras = [
  { id: 'a1', name: 'a1-name', sessions: ['s1', 's2'] },
  { id: 'a2', name: 'a2-name', sessions: ['s2'] }
]
exports.auras = auras

/**
 * public profile participating in discussion: singles, match-makers, etc.
 * - created by a session
 * - edited by any session
 * - can be locked to a specific user aura
 * types:
 * - profile: single, match-maker, pet, etc.
 * - topic of discussion: building, park, etc. something that can't 'talk'
 */
let profiles = [
  {

    id: 'p1',
    title: 'p1-title',
    author: 's1', // TODO: maybe include user ID to for easier tracking
    type: 'SINGLE',
    text: 'descriptive text', // markdown
    photos: ['http://images.fonearena.com/blog/wp-content/uploads/2013/11/Lenovo-p780-camera-sample-10.jpg']
  },
  { id: 'p1.1', title: 'p1-title', author: 's2', edits: 'p1' },
  { id: 'p2', title: 'p2-title', author: 's2', type: 'SINGLE' },
  { id: 'p3', title: 'p3-title', author: 's2', type: 'MATCHER' },
  { id: 'p4', title: 'p4-title', author: 's2', type: 'MODERATOR' }
]
exports.profiles = profiles

/**
 * types of public messages:
 * session about/to public profile: discuss and rate profile
 *                                  discuss and rate match-maker
 * session about pair of public profiles, discuss and rate a match
 * session as public profile about pair of public profiles, discuss and rate a match
 * session as public profile to another profile: as a match-maker
 *                                               as a match
 */
let comments = [
  { id: 'c1', title: 'c1-title', author: 's1', about: ['p1.1'] },
  {
    id: 'c2',
    title: 'c2-title',
    author: 's2', // TODO: maybe include user ID to for easier tracking
    about: ['p1', 'p2'],
    as: 'p3',
    text: 'descriptive text' // markdown
  },
  { id: 'c3', title: 'c3-title', author: 's1', about: ['p2'], as: 'p1' }
]
exports.comments = comments
