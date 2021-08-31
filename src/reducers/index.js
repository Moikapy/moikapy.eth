import { combineReducers } from 'redux';

import session from './session';
import errors from './errors';

const rootReducer = combineReducers({
  errors,
  session,
});

export default rootReducer;
