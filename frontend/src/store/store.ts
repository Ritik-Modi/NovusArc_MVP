import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice';
// import other reducers as needed

const store = configureStore({
  reducer: {
    auth: authReducer,
    // add other reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
