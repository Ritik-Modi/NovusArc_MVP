// Import necessary modules from Redux Toolkit and other dependencies
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { userEndPoints } from "../services/api";
import { handleAxiosError } from "../utils/handleAxiosError";
import type { AppDispatch } from "./store";


interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface UserState {
    user: User | null;
    loading: boolean;
    error: string | null;
}
const initialState: UserState = {
    user: null,
    loading: false,
    error: null,
};


const fetchUserProfile = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.get<User>(
            userEndPoints.getCurrentUser,
            { withCredentials: true }
        );
        dispatch(setUser(response.data));
        dispatch(setError(null)); 
    } catch (error) {
        dispatch(setError(handleAxiosError(error)));
        dispatch(setUser(null));

    }finally{
        dispatch(setLoading(false));
    }
}


const updateUserProfile = (updatedData: Partial<User>) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.put<User>(
            userEndPoints.updateUser(updatedData.id!),
            updatedData,
            { withCredentials: true }
        );
        dispatch(setUser(response.data));
        dispatch(setError(null));
        
    } catch (error) {
        dispatch(setError(handleAxiosError(error)));
    } finally {
        dispatch(setLoading(false));
    }
}

const deleteUser = (userId: string) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        await axios.delete(
            userEndPoints.deleteUser(userId),
            { withCredentials: true }
        );
        dispatch(clearUser());
    } catch (error) {
        dispatch(setError(handleAxiosError(error)));
    } finally {
        dispatch(setLoading(false));
    }
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User | null>) {
            state.user = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        clearUser(state) {
            state.user = null;
            state.error = null;
        },
    },
});

export const { setUser, setLoading, setError, clearUser } = userSlice.actions;

export { fetchUserProfile, updateUserProfile, deleteUser };

export const selectUser = (state: { user: UserState }) => state.user.user;
export const selectUserLoading = (state: { user: UserState }) => state.user.loading;
export const selectUserError = (state: { user: UserState }) => state.user.error;

export default userSlice.reducer;

