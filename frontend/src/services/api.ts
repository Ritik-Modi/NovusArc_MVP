const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const withParams = (endpoint: string, params: Record<string, string | number>): string => {
  return Object.entries(params).reduce(
    (acc, [key, val]) => acc.replace(`:${key}`, encodeURIComponent(val.toString())),
    endpoint
  );
};


export const authEndPoints = {
    signup: `${BASE_URL}/auth/signup`,
    login: `${BASE_URL}/auth/login`,
    logout: `${BASE_URL}/auth/logout`,
    refreshToken: `${BASE_URL}/auth/refresh`,
    sendOTP: `${BASE_URL}/auth/send-otp`,
    resetPassword: `${BASE_URL}/auth/reset-password`,
}

export const userEndPoints = {
    getUsersList : `${BASE_URL}/users`,
    getCurrentUser : `${BASE_URL}/users/me`,
    getUserById : (id: string | number) => withParams(`${BASE_URL}/users/:id`, { id }),
    updateUser : (id: string | number) => withParams(`${BASE_URL}/users/:id`, { id }),
    deleteUser : (id: string | number) => withParams(`${BASE_URL}/users/:id`, { id }),
    activateUser : (id: string | number) => withParams(`${BASE_URL}/users/:id/activate`, { id }),
}

export const studentEndPoints = {
    getStudentsList : `${BASE_URL}/students`,
    getStudentById : (id: string | number) => withParams(`${BASE_URL}/students/:id`, { id }),
    // createStudent : `${BASE_URL}/students`,
    updateStudent : (id: string | number) => withParams(`${BASE_URL}/students/:id`, { id }),
    // deleteStudent : (id: string | number) => withParams(`${BASE_URL}/students/:id`, { id }),
    uploadResume : (id: string | number) => withParams(`${BASE_URL}/students/:id/resume`, { id }),
}

export const companiesEndPoints = {
    getCompaniesList : `${BASE_URL}/companies`,
    getCompanyById : (id: string | number) => withParams(`${BASE_URL}/companies/:id`, { id }),
    createCompany : `${BASE_URL}/companies`,
    updateCompany : (id: string | number) => withParams(`${BASE_URL}/companies/:id`, { id }),
    deleteCompany : (id: string | number) => withParams(`${BASE_URL}/companies/:id`, { id }),
    restoreCompany : (id: string | number) => withParams(`${BASE_URL}/companies/:id/restore`, { id }),
}


export const jobEndPoints = {
    getJobsList : `${BASE_URL}/jobs`,
    getJobById : (id: string | number) => withParams(`${BASE_URL}/jobs/:id`, { id }),
    createJob : `${BASE_URL}/jobs`,
    updateJob : (id: string | number) => withParams(`${BASE_URL}/jobs/:id`, { id }),
    deleteJob : (id: string | number) => withParams(`${BASE_URL}/jobs/:id`, { id }),
}

export const roundEndPoints = {
    createRound : (jobId: string | number) => withParams(`${BASE_URL}/jobs/:jobId/rounds/create`, { jobId }),
    getRoundsByJob : (jobId: string | number) => withParams(`${BASE_URL}/jobs/:jobId/rounds`, { jobId }),
    getRoundById : (jobId: string | number, id: string | number) => withParams(`${BASE_URL}/jobs/:jobId/rounds/:id`, { jobId, id }),
    updateRound : (jobId: string | number, id: string | number) => withParams(`${BASE_URL}/jobs/:jobId/rounds/:id`, { jobId, id }),
    deleteRound : (jobId: string | number, id: string | number) => withParams(`${BASE_URL}/jobs/:jobId/rounds/:id`, { jobId, id }),
    reorderRounds : (jobId: string | number) => withParams(`${BASE_URL}/jobs/:jobId/rounds/reorder`, { jobId }),
}

export const applicationEndPoints = {
    applyToJob : (jobId: string | number) => withParams(`${BASE_URL}/applications/:jobId/apply`, { jobId }),
    getapplicationsListOfJOb : (jobId: string | number) => withParams(`${BASE_URL}/applications/job/:jobId`, { jobId }),
    getStudentApplications : (studentId: string | number) => withParams(`${BASE_URL}/applications/student/:studentId`, { studentId }),
    updateApplicationStatus : (applicationId: string | number) => withParams(`${BASE_URL}/applications/:applicationId/status`, { applicationId }),
    withdrawApplication : (applicationId: string | number) => withParams(`${BASE_URL}/applications/:applicationId/withdraw`, { applicationId }),
}

export const notificationEndPints = {
    getNotifications : `${BASE_URL}/notifications`,
    markAsRead : (id: string | number) => withParams(`${BASE_URL}/notifications/:id/read`, { id }),
    createNotification : `${BASE_URL}/notifications`,
    deleteNotification : (id: string | number) => withParams(`${BASE_URL}/notifications/:id`, { id }),
}

export const interviewEndPoints = {
    scheduleInterview : `${BASE_URL}/interviews/schedule`,
    getInterviewById : (id: string | number) => withParams(`${BASE_URL}/interviews/:id`, { id }),
    updateInterview : (id: string | number) => withParams(`${BASE_URL}/interviews/:id`, { id }),
    // cancelInterview : (id: string | number) => withParams(`${BASE_URL}/interviews/:id/cancel`, { id }),
    getInterviewsList : `${BASE_URL}/interviews`,
}

export const importEndPoints = {

}

export const analyseEndPoints = {
    dashboardSummary : `${BASE_URL}/analytics/summary`,
    placementsOverTime : `${BASE_URL}/analytics/placements`,
    companyMetrics : (id: string | number) => withParams(`${BASE_URL}/analytics/company/:id`, { id }),

}