import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "./store";

export interface ImportJob {
	id: string;
	uploadedBy?: string;
	type: string;
	status: 'queued' | 'processing' | 'done' | 'failed';
	fileUrl?: string;
	error?: string;
	meta?: Record<string, any>;
	resultSummary?: Record<string, any>;
	createdAt?: string;
	updatedAt?: string;
}

interface ImportsState {
	importJobs: ImportJob[];
	loading: boolean;
	error: string | null;
}

const initialState: ImportsState = {
	importJobs: [],
	loading: false,
	error: null,
};

const importsSlice = createSlice({
	name: "imports",
	initialState,
	reducers: {
		setImportJobs(state, action: PayloadAction<ImportJob[]>) {
			state.importJobs = action.payload;
		},
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload;
		},
		clearImportJobs(state) {
			state.importJobs = [];
		},
	},
});

export const {
	setImportJobs,
	setLoading,
	setError,
	clearImportJobs,
} = importsSlice.actions;

export default importsSlice.reducer;
