import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "./store";

export interface Notification {
	id: string;
	receiver: string;
	type: 'system' | 'email' | 'push' | 'in_app';
	title?: string;
	body?: string;
	payload?: Record<string, any>;
	read: boolean;
	sentAt?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface NotificationsState {
	notifications: Notification[];
	loading: boolean;
	error: string | null;
}

const initialState: NotificationsState = {
	notifications: [],
	loading: false,
	error: null,
};

const notificationsSlice = createSlice({
	name: "notifications",
	initialState,
	reducers: {
		setNotifications(state, action: PayloadAction<Notification[]>) {
			state.notifications = action.payload;
		},
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload;
		},
		clearNotifications(state) {
			state.notifications = [];
		},
	},
});

export const {
	setNotifications,
	setLoading,
	setError,
	clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
