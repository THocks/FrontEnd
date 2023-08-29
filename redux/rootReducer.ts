import { combineReducers } from 'redux';
// slices
import clientReducer from './slices/client';

const rootReducer = combineReducers({
  client: clientReducer,
});

export default rootReducer;
