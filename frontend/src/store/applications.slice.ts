import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { applicationEndPoints } from "../services/api";
import { handleAxiosError } from "../utils/handleAxiosError";
import type { AppDispatch } from "./store";

// Application interface matching backend model
export interface Application {
	id: string; // maps to _id
	job: string;
	student: string;
	studentProfile?: string;
	status: 'applied' | 'shortlisted' | 'rejected' | 'hired' | 'withdrawn';
	resumeUrl?: string;
	coverLetter?: string;
	scores?: Record<string, any>; 
	appliedAt?: string;
	metadata?: Record<string, any>;
	createdAt?: string;
	updatedAt?: string;
}

interface ApplicationsState {
	applications: Application[];
	selectedApplication: Application | null;
	loading: boolean;
	error: string | null;
}

const initialState: ApplicationsState = {
	applications: [],
	selectedApplication: null,
	loading: false,
	error: null,
};

// Thunks
export const fetchApplicationsList = (jobId: string) => async (dispatch: AppDispatch) => {
	dispatch(setLoading(true));
	try {
		const response = await axios.get<Application[]>(
			applicationEndPoints.getapplicationsListOfJOb(jobId),
			{ withCredentials: true }
		);
		dispatch(setApplications(response.data));
		dispatch(setError(null));
	} catch (error) {
		dispatch(setError(handleAxiosError(error)));
	} finally {
		dispatch(setLoading(false));
	}
};

export const fetchApplicationById = (id: string) => async (dispatch: AppDispatch) => {
	dispatch(setLoading(true));
	try {
		const response = await axios.get<{ success: boolean; data: Application }>(
			`/applications/${id}`,
			{ withCredentials: true }
		);
		dispatch(setSelectedApplication(response.data.data));
		dispatch(setError(null));
	} catch (error) {
		dispatch(setError(handleAxiosError(error)));
	} finally {
		dispatch(setLoading(false));
	}
};

export const createApplication = (applicationData: Partial<Application>) => async (dispatch: AppDispatch) => {
	dispatch(setLoading(true));
	try {
		const response = await axios.post<Application>(
			applicationEndPoints.applyToJob(applicationData.job!),
			applicationData,
			{ withCredentials: true }
		);
		dispatch(setSelectedApplication(response.data));
		dispatch(setError(null));
	} catch (error) {
		dispatch(setError(handleAxiosError(error)));
	} finally {
		dispatch(setLoading(false));
	}
};

export const updateApplication = (id: string, updatedData: Partial<Application>) => async (dispatch: AppDispatch) => {
	dispatch(setLoading(true));
	try {
		const response = await axios.put<Application>(
			applicationEndPoints.updateApplicationStatus(id),
			updatedData,
			{ withCredentials: true }
		);
		dispatch(setSelectedApplication(response.data));
		dispatch(setError(null));
	} catch (error) {
		dispatch(setError(handleAxiosError(error)));
	} finally {
		dispatch(setLoading(false));
	}
};

export const deleteApplication = (id: string) => async (dispatch: AppDispatch) => {
	dispatch(setLoading(true));
	try {
		await axios.delete(
			applicationEndPoints.withdrawApplication(id),
			{ withCredentials: true }
		);
		dispatch(clearSelectedApplication());
		dispatch(setError(null));
	} catch (error) {
		dispatch(setError(handleAxiosError(error)));
	} finally {
		dispatch(setLoading(false));
	}
};

// Slice
const applicationsSlice = createSlice({
	name: "applications",
	initialState,
	reducers: {
		setApplications(state, action: PayloadAction<Application[]>) {
			state.applications = action.payload;
		},
		setSelectedApplication(state, action: PayloadAction<Application | null>) {
			state.selectedApplication = action.payload;
		},
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload;
		},
		clearSelectedApplication(state) {
			state.selectedApplication = null;
		},
	},
});

export const {
	setApplications,
	setSelectedApplication,
	setLoading,
	setError,
	clearSelectedApplication,
} = applicationsSlice.actions;

// Selectors
export const selectApplications = (state: { applications: ApplicationsState }) => state.applications.applications;
export const selectSelectedApplication = (state: { applications: ApplicationsState }) => state.applications.selectedApplication;
export const selectApplicationsLoading = (state: { applications: ApplicationsState }) => state.applications.loading;
export const selectApplicationsError = (state: { applications: ApplicationsState }) => state.applications.error;

export default applicationsSlice.reducer;
