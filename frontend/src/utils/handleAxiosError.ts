import axios, { AxiosError } from 'axios';

/**
 * Handles errors thrown by Axios requests and returns a user-friendly message.
 * @param error - The error thrown by Axios or other sources
 * @returns A string describing the error
 */
export const handleAxiosError = (error: unknown): string => {
  // Axios error
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    // Server responded with a status code outside 2xx
    if (axiosError.response) {
      // Try to extract a message from the response data
      const data = axiosError.response.data;
      if (data) {
        if (typeof data === 'string') return data;
        if (typeof data.message === 'string') return data.message;
        if (typeof data.error === 'string') return data.error;
      }
      return `Request failed with status ${axiosError.response.status}`;
    }
    // No response received (network error, timeout, etc.)
    if (axiosError.request) {
      return 'No response received from server. Please check your network connection.';
    }
    // Something happened in setting up the request
    return axiosError.message || 'An unknown Axios error occurred';
  }
  // Non-Axios error (could be string, Error, or unknown)
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};