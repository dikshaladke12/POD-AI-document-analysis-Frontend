import { apiUrl } from "../../Utils/Environment";

const ApiUrlConstant = {
  /* Login */
  loginService: () => `${apiUrl}/auth/login/`,

  /* Documents */
  docsListService: () => `${apiUrl}/provider/documents/`,
  docsRemoveService: (docId) => `${apiUrl}/provider/remove-document/${docId}/`,
  docsUploadService: () => `${apiUrl}/provider/upload/`,
  docsViewDetailService: (docId) =>`${apiUrl}/provider/view-documents/${docId}/`,

  /* Fax Provider */
  docsListProviderService: () => `${apiUrl}/provider/fax-providers/list/`,
  faxProviderService: () => `${apiUrl}/provider/fax-providers/create/`,
  docsRemoveProviderService: (docId) => `${apiUrl}/provider/fax-providers/update/${docId}/`,
  docsUpdateProviderService: (docId) => `${apiUrl}/provider/fax-providers/update/${docId}/`,
  docsViewProviderService: (docId) => `${apiUrl}/provider/fax-providers/details/${docId}/`,

  // Forgot Password
  forgotPasswordSendOtp: () => `${apiUrl}/auth/forgot-password/email/`,
  forgotPasswordVerifyOtp: () => `${apiUrl}/auth/forgot-password/verify/`,
  forgotPasswordReset: () => `${apiUrl}/auth/forgot-password/reset/`,

  // Dashboard
  inspectStats: () => `${apiUrl}/provider/inspect/`,

  // Profile
  getProfileData: () => `${apiUrl}/auth/profile/`,
};

export default ApiUrlConstant;
