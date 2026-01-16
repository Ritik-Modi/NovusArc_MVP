import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "./store";

export interface ExportJob {
	id: string;
	createdBy?: string;
	type: string;
	status: 'queued' | 'processing' | 'done' | 'failed';
	resultUrl?: string;
	error?: string;
	meta?: Record<string, any>;
	createdAt?: string;
	updatedAt?: string;
}

interface ExportsState {
	exportJobs: ExportJob[];
	loading: boolean;
	error: string | null;
}

const initialState: ExportsState = {
	exportJobs: [],
	loading: false,
	error: null,
};

const exportsSlice = createSlice({
	name: "exports",
	initialState,
	reducers: {
		setExportJobs(state, action: PayloadAction<ExportJob[]>) {
			state.exportJobs = action.payload;
		},
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload;
		},
		clearExportJobs(state) {
			state.exportJobs = [];
		},
	},
});

export const {
	setExportJobs,
	setLoading,
	setError,
	clearExportJobs,
} = exportsSlice.actions;

export default exportsSlice.reducer;
