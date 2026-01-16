import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { authEndPoints } from "../services/api";
import { handleAxiosError } from "../utils/handleAxiosError";
import type { AppDispatch } from "./store";


interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface LoginPayload {
  email: string;
  password: string;
}

// interface SignupPayload {
//   name : string;
//   email : string;
//   password : string;
// }

interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};



const loginUser = (payload: LoginPayload) => async (dispatch: AppDispatch) => { // TOODO: we are puting any here in the dispatch can we any thing else so error not show up
  dispatch(setLoading(true));
  try {
    const response = await axios.post<AuthResponse>(
      authEndPoints.login,
      payload,
      { withCredentials: true }
    );
    dispatch(setUser(response.data.user));
    dispatch(setToken(response.data.token || null));
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError(handleAxiosError(error)));
    dispatch(setUser(null)); 
    dispatch(setToken(null));
  } finally {
    dispatch(setLoading(false));
  }
};

const logoutUser = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  try {
    await axios.post(authEndPoints.logout, {}, { withCredentials: true });
    dispatch(clearAuth());
  } catch (error) {
    dispatch(setError(handleAxiosError(error)));
    dispatch(clearAuth());
  } finally {
    dispatch(setLoading(false));
  }
};


// export const signupUser = (payload: SignupPayload) => async (dispatch: any) => {
//   dispatch(setLoading(true));
//   try {
//     const response = await axios.post<AuthResponse>(authEndPoints.signup, payload, { withCredentials: true });
//     dispatch(setUser(response.data.user));
//     dispatch(setToken(response.data.token || null));
//     dispatch(setError(null));
//   } catch (error) {
//     dispatch(setError(handleAxiosError(error)));
//     dispatch(setUser(null));
//     dispatch(setToken(null));
//   } finally {
//     dispatch(setLoading(false));
//   }
// };


export const verifyAuthUser = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get<AuthResponse>(authEndPoints.verify, { withCredentials: true });
    dispatch(setUser(response.data.user));
    dispatch(setToken(response.data.token || null));
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError(handleAxiosError(error)));
    dispatch(clearAuth());
  } finally {
    dispatch(setLoading(false));
  }
};



const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      state.isAuthenticated = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
  // No extraReducers needed
});

export const {
  setLoading,
  setUser,
  setToken,
  setError,
  clearAuth,
  clearError,
} = authSlice.actions;

export const seleteAuth = (state: { auth: AuthState }) => state.auth;
export const seleteUser = (state: { auth: AuthState }) => state.auth.user;
export const seleteIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const seleteAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const seleteAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
export { loginUser, logoutUser };
