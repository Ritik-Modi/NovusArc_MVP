import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "./store";
import { studentEndPoints } from "../services/api";
import { handleAxiosError } from "../utils/handleAxiosError";
// Thunks
export const fetchStudentsList = () => async (dispatch: AppDispatch) => {
	dispatch(setLoading(true));
	try {
		const response = await axios.get<StudentProfile[]>(
			studentEndPoints.getStudentsList,
			{ withCredentials: true }
		);
		dispatch(setStudents(response.data));
		dispatch(setError(null));
	} catch (error) {
		dispatch(setError(handleAxiosError(error)));
	} finally {
		dispatch(setLoading(false));
	}
};

export const fetchStudentById = (id: string) => async (dispatch: AppDispatch) => {
	dispatch(setLoading(true));
	try {
		const response = await axios.get<StudentProfile>(
			studentEndPoints.getStudentById(id),
			{ withCredentials: true }
		);
		dispatch(setSelectedStudent(response.data));
		dispatch(setError(null));
	} catch (error) {
		dispatch(setError(handleAxiosError(error)));
	} finally {
		dispatch(setLoading(false));
	}
};

// Uncomment and implement these endpoints in your backend if needed
export const createStudent = (studentData: Partial<StudentProfile>) => async (dispatch: AppDispatch) => {
	dispatch(setLoading(true));
	try {
		const response = await axios.post<StudentProfile>(
			'/students',
			studentData,
			{ withCredentials: true }
		);
		dispatch(setSelectedStudent(response.data));
		dispatch(setError(null));
	} catch (error) {
		dispatch(setError(handleAxiosError(error)));
	} finally {
		dispatch(setLoading(false));
	}
};

export const updateStudent = (id: string, updatedData: Partial<StudentProfile>) => async (dispatch: AppDispatch) => {
	dispatch(setLoading(true));
	try {
		const response = await axios.put<StudentProfile>(
			studentEndPoints.updateStudent(id),
			updatedData,
			{ withCredentials: true }
		);
		dispatch(setSelectedStudent(response.data));
		dispatch(setError(null));
	} catch (error) {
		dispatch(setError(handleAxiosError(error)));
	} finally {
		dispatch(setLoading(false));
	}
};

// Uncomment and implement this endpoint in your backend if needed
export const deleteStudent = (id: string) => async (dispatch: AppDispatch) => {
	dispatch(setLoading(true));
	try {
		await axios.delete(
			`/students/${id}`,
			{ withCredentials: true }
		);
		dispatch(clearSelectedStudent());
		dispatch(setError(null));
	} catch (error) {
		dispatch(setError(handleAxiosError(error)));
	} finally {
		dispatch(setLoading(false));
	}
};

export interface StudentProfile {
	id: string;
	user: string;
	rollNumber?: string;
	collageIdCardUrl?: string;
	dob?: string;
	fatherName?: string;
	motherName?: string;
	fatherNumber?: string;
	motherNumber?: string;
	college?: string;
	branch?: string;
	department?: string;
	year?: number;
	semester?: number;
	percentage10th?: number;
	percentage12th?: number;
	cgpa?: number;
	backlogs?: boolean;
	activeBacklogs?: number;
	skills?: string[];
	markSheet10thUrl?: string;
	markSheet12thUrl?: string;
	resumeUrl?: string;
	metadata?: Record<string, any>;
	createdAt?: string;
	updatedAt?: string;
}

interface StudentsState {
	students: StudentProfile[];
	selectedStudent: StudentProfile | null;
	loading: boolean;
	error: string | null;
}

const initialState: StudentsState = {
	students: [],
	selectedStudent: null,
	loading: false,
	error: null,
};

const studentsSlice = createSlice({
	name: "students",
	initialState,
	reducers: {
		setStudents(state, action: PayloadAction<StudentProfile[]>) {
			state.students = action.payload;
		},
		setSelectedStudent(state, action: PayloadAction<StudentProfile | null>) {
			state.selectedStudent = action.payload;
		},
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},
		setError(state, action: PayloadAction<string | null>) {
			state.error = action.payload;
		},
		clearSelectedStudent(state) {
			state.selectedStudent = null;
		},
	},
});

export const {
	setStudents,
	setSelectedStudent,
	setLoading,
	setError,
	clearSelectedStudent,
} = studentsSlice.actions;

export default studentsSlice.reducer;
