/** @module store/AuthStore */
import { AppStore } from './AppStore.js';
import { AuthService } from '../services/AuthService.js';

class AuthStoreClass extends AppStore {
  constructor() {
    super();
    // Re-initialize as its own store
    this._name  = 'auth';
    this._state = {
      user:      AuthService.getCurrentUser(),
      session:   AuthService.getSession(),
      isLoggedIn: AuthService.isLoggedIn(),
      isAdmin:   AuthService.isAdmin(),
      loading:   false,
      error:     null,
    };
  }
  // Override to use _state
  getState()  { return { ...this._state }; }
  setState(p) {
    this._state = { ...this._state, ...p };
    import('../utils/helpers.js').then(({ bus }) =>
      bus.emit('store:update', { store: 'auth', next: this._state, prev: {}, changed: Object.keys(p) })
    );
  }

  async login(pin) {
    this.setState({ loading: true, error: null });
    try {
      const user = await AuthService.login(pin);
      this.setState({ user, session: AuthService.getSession(), isLoggedIn: true,
                      isAdmin: AuthService.isAdmin(), loading: false });
      return user;
    } catch (err) {
      this.setState({ loading: false, error: err.message });
      throw err;
    }
  }

  logout() {
    AuthService.logout();
    this.setState({ user: null, session: null, isLoggedIn: false, isAdmin: false, error: null });
  }
}

export const authStore = new AuthStoreClass();
