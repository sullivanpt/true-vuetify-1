// state data about the current session and user

export const state = () => ({
  cookies: false,
  userId: null,
  sessionName: '',
  userName: '',
  userAuthorized: false,
  email: 'test@test.com' // TODO: generic notifications
})

export const mutations = {
  reload (state, data) {
    state.cookies = !!(data.settings && data.settings.cookies)
    state.userId = data.user ? data.user.id : null
    state.sessionName = (data.session && data.session.name) || ''
    state.userName = (data.user && data.user.name) || ''
    state.userAuthorized = !!data.authorized
  },
  acceptCookies (state) {
    state.cookies = true
  }
}

export const actions = {
  async reload ({ commit }) {
    // TODO: maybe a wait cursor here
    let r = await this.$api.meReload()
    if (!r.ok) {
      console.log('reload', r) // TODO: error handling and logging
    } else {
      commit('reload', await r.json())
      return true // success result for login/logout
    }
  },
  async acceptCookies ({ commit }) {
    commit('acceptCookies') // immediate UI feedback, no worries if async fails
    let r = await this.$api.meSaveSetting({ cookies: true })
    if (!r.ok) {
      console.log('saveSessionSetting', r) // TODO: error handling and logging
    }
  },
  async create ({ dispatch }, credentials) {
    let r = await this.$api.meCreate(credentials)
    if (!r.ok) { // TODO: status 400, 403, 409 are different
      console.log('create', r) // TODO: error handling and logging
    } else {
      return dispatch('reload')
    }
  },
  async login ({ dispatch }, credentials) {
    let r = await this.$api.mePassword(credentials)
    if (!r.ok) {
      console.log('login', r) // TODO: error handling and logging
    } else {
      return dispatch('reload')
    }
  },
  async logout ({ dispatch }, credentials) {
    let r = await this.$api.meLogout(credentials)
    if (!r.ok) {
      console.log('logout', r) // TODO: error handling and logging
    } else {
      return dispatch('reload')
    }
  }
}
