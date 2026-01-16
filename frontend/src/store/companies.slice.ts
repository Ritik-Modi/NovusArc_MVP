import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { companiesEndPoints } from "../services/api";
import { handleAxiosError } from "../utils/handleAxiosError";
import type { AppDispatch } from "./store";



interface Company {
    id: string; // maps to _id
    name: string;
    companyCode_novusarc?: string;
    companyCode: string;
    slug?: string;
    website?: string;
    logoUrl?: string;
    description?: string;
    isActive: boolean;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
    // Extra frontend/UI fields (optional)
    address?: string;
    industry?: string;
    contactEmail?: string;
    contactPhone?: string;
    recruiterName?: string;
    companySize?: number;
}


interface CompaniesState {
    companies: Company[];
    selectedCompany: Company | null;
    loading: boolean;
    error: string | null;
}
const initialState: CompaniesState = {
    companies: [],
    selectedCompany: null,
    loading: false,
    error: null,
};

const fetchCompaniesList = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.get<Company[]>(
            companiesEndPoints.getCompaniesList,
            { withCredentials: true }
        );
        dispatch(setCompanies(response.data));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(handleAxiosError(error)));
    } finally {
        dispatch(setLoading(false));
    }
}
const fetchCompanyById = (id: string | number) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.get<Company>(
            companiesEndPoints.getCompanyById(id),
            { withCredentials: true }
        );
        dispatch(setSelectedCompany(response.data));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(handleAxiosError(error)));
    } finally {
        dispatch(setLoading(false));
    }
} 
const createCompany = (companyData: Partial<Company>) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.post<Company>(
            companiesEndPoints.createCompany,
            companyData,
            { withCredentials: true }
        );
        dispatch(setSelectedCompany(response.data));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(handleAxiosError(error)));
    } finally {
        dispatch(setLoading(false));
    }
}
const updateCompany = (id: string | number, updatedData: Partial<Company>) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.put<Company>(
            companiesEndPoints.updateCompany(id),
            updatedData,
            { withCredentials: true }
        );
        dispatch(setSelectedCompany(response.data));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(handleAxiosError(error)));
    } finally {
        dispatch(setLoading(false));
    }
}
const deleteCompany = (id: string | number) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        await axios.delete(
            companiesEndPoints.deleteCompany(id),
            { withCredentials: true }
        );
        dispatch(clearSelectedCompany());
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(handleAxiosError(error)));
    } finally {
        dispatch(setLoading(false));
    }
}


const companiesSlice = createSlice({
    name: "companies",
    initialState,
    reducers: {
        setCompanies(state, action: PayloadAction<Company[]>) {
            state.companies = action.payload;
        },
        setSelectedCompany(state, action: PayloadAction<Company>) {
            state.selectedCompany = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        clearSelectedCompany(state) {
            state.selectedCompany = null;
        },
    },
});

export const {
    setCompanies,
    setSelectedCompany,
    setLoading,
    setError,
    clearSelectedCompany,
} = companiesSlice.actions;


export {
    fetchCompaniesList,
    fetchCompanyById,
    createCompany,
    updateCompany,
    deleteCompany
}

export const selectCompanies = (state: { companies: CompaniesState }) => state.companies.companies;
export const selectSelectedCompany = (state: { companies: CompaniesState }) => state.companies.selectedCompany;
export const selectCompaniesLoading = (state: { companies: CompaniesState }) => state.companies.loading;
export const selectCompaniesError = (state: { companies: CompaniesState }) => state.companies.error;
export default companiesSlice.reducer;
