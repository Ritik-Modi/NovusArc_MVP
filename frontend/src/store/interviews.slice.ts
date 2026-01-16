import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "./store";

export interface Interview {
	id: string;
	application: string;
	job: string;
	candidate: string;
	interviewer?: string;
	startTime: string;
	endTime?: string;
	mode?: 'online' | 'offline';
	location?: string;
	status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
	notes?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface InterviewsState {
	interviews: Interview[];
	selectedInterview: Interview | null;
	loading: boolean;
	error: string | null;
}

const initialState: InterviewsState = {
	interviews: [],
	selectedInterview: null,
	loading: false,
	error: null,
};

const interviewsSlice = createSlice({
	name: "interviews",
	initialState,
	reducers: {
		setInterviews(state, action: PayloadAction<Interview[]>) {
			state.interviews = action.payload;
		},
		setSelectedInterview(state, action: PayloadAction<Interview | null>) {
			state.selectedInterview = action.payload;
		},
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload;
		},
		clearSelectedInterview(state) {
			state.selectedInterview = null;
		},
	},
});

export const {
	setInterviews,
	setSelectedInterview,
	setLoading,
	setError,
	clearSelectedInterview,
} = interviewsSlice.actions;

export default interviewsSlice.reducer;
