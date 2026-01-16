import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { jobEndPoints} from "../services/api";
import { handleAxiosError } from "../utils/handleAxiosError";
import type { AppDispatch } from "./store";

interface Job {
    id: string; // maps to _id
    title: string;
    jobCode?: string;
    company: string; // company ObjectId
    description?: string;
    location?: string;
    salaryRange?: { min?: number; max?: number };
    type?: 'full_time' | 'part_time' | 'intern' | 'contract';
    status: 'draft' | 'open' | 'closed' | 'archived';
    postedBy?: string; // user ObjectId
    tags?: string[];
    applicationDeadline?: string; // ISO string
    listedAt?: string; // ISO string
    eligibilityCriteria?: string[];
    additionalAttechments?: string[];
    // metadata?: Record<string, any>;?
    createdAt?: string;
    updatedAt?: string;
}


interface JobsState {
    jobs: Job[];
    selectedJob: Job | null;
    loading: boolean;
    error: string | null;
}

const initialState: JobsState = {
    jobs: [],
    selectedJob: null,
    loading: false,
    error: null,
};

const fetchJobsList = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.get<Job[]>(
            jobEndPoints.getJobsList,
            { withCredentials: true }
        );
        dispatch(setJobs(response.data));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(handleAxiosError(error)));
    } finally {
        dispatch(setLoading(false));
    }
}
const fetchJobById = (id: string | number) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.get<Job>(
            jobEndPoints.getJobById(id),
            { withCredentials: true }
        );
        dispatch(setSelectedJob(response.data));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(handleAxiosError(error)));
    } finally {
        dispatch(setLoading(false));
    }   
}
const createJob = (jobData: Partial<Job>) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.post<Job>(
            jobEndPoints.createJob,
            jobData,
            { withCredentials: true }
        );
        dispatch(setSelectedJob(response.data));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(handleAxiosError(error)));
    } finally {
        dispatch(setLoading(false));
    }
}
const updateJob = (id: string | number, updatedData: Partial<Job>) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.put<Job>(
            jobEndPoints.updateJob(id),
            updatedData,
            { withCredentials: true }
        );
        dispatch(setSelectedJob(response.data));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(handleAxiosError(error)));
    } finally {
        dispatch(setLoading(false));
    }
}
const deleteJob = (id: string | number) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        await axios.delete(
            jobEndPoints.deleteJob(id),
            { withCredentials: true }
        );
        dispatch(clearSelectedJob());
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(handleAxiosError(error)));
    } finally {
        dispatch(setLoading(false));
    }
}

const jobsSlice = createSlice({
    name: "jobs",
    initialState,
    reducers: {
        setJobs(state, action: PayloadAction<Job[]>) {
            state.jobs = action.payload;
        },
        setSelectedJob(state, action: PayloadAction<Job | null>) {
            state.selectedJob = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        clearSelectedJob(state) {
            state.selectedJob = null;
        },
    },
});

export const {
    setJobs,
    setSelectedJob,
    setLoading,
    setError,
    clearSelectedJob,
} = jobsSlice.actions;

export {
    fetchJobsList,
    fetchJobById,
    createJob,
    updateJob,
    deleteJob,
};

export const selectJobs = (state: { jobs: JobsState }) => state.jobs.jobs;
export const selectSelectedJob = (state: { jobs: JobsState }) => state.jobs.selectedJob;
export const selectJobsLoading = (state: { jobs: JobsState }) => state.jobs.loading;
export const selectJobsError = (state: { jobs: JobsState }) => state.jobs.error;

export default jobsSlice.reducer;

