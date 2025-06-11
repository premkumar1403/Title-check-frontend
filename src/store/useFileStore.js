import {create} from 'zustand'
import axios from 'axios'
import { toast } from 'react-toastify'

const useFileStore = create((set, get) => ({
  // State
  files: [],
  page: 1,
  totalPages: 1,
  query: '',
  isUploading: false,
  isUploaded: false,
  uploadingMessage: '',
  selectedFile: null,
  uploadedFileData: null,
  isLoading: false,
  uploadedFileName: '',
  isRefreshing: false,
  excludedConferenceNames: [],
  isDownloading: false,
  downloadProgress: { current: 0, total: 0 },
  downloadCancelToken: null,
  validationErrors: '',
  selectCmd: null,
 
  // Cancel tokens
  cancelTokenSource: null,

  // Actions
  setFiles: (files) => set({ files }),
  setPage: (page) => set({ page }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setQuery: (query) => set({ query }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsUploaded: (isUploaded) => set({ isUploaded }),
  setUploadingMessage: (uploadingMessage) => set({ uploadingMessage }),
  setSelectedFile: (selectedFile) => set({ selectedFile }),
  setUploadedFileData: (uploadedFileData) => set({ uploadedFileData }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setUploadedFileName: (uploadedFileName) => set({ uploadedFileName }),
  setIsRefreshing: (isRefreshing) => set({ isRefreshing }),
  setExcludedConferenceNames: (excludedConferenceNames) => set({ excludedConferenceNames }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setDownloadProgress: (downloadProgress) => set({ downloadProgress }),
  setDownloadCancelToken: (downloadCancelToken) => set({ downloadCancelToken }),
  setValidationErrors: (validationErrors) => set({ validationErrors }),
  setselectCmd: (selectCmd) => set({ selectCmd }),
  // API Base URL
  getApiBaseUrl: () => {
    return import.meta.env.VITE_REACT_APP_NET_URI || import.meta.env.VITE_REACT_APP_LOCAL_URI;
  },
  // Get auth headers
  getAuthHeaders: () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  }),

  // Fetch data (search/browse)
  fetchData: async (searchTerm = '', currentPage = 1, logout, navigate) => {
    try {
      const { getApiBaseUrl, getAuthHeaders } = get();
      const res = await axios.get(
        `${getApiBaseUrl()}/api/v1/file/file-get?q=${searchTerm}&page=${currentPage}`,
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );
      
      set({ 
        files: res.data.data, 
        totalPages: res.data.total_page || 1 
      });
      
      return res.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data. Please try again.');
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout(navigate);
      }
      throw error;
    }
  },

  // Fetch uploaded file data
  fetchUploadedFileData: async (currentPage = 1, logout, navigate) => {
    const { uploadedFileData, getApiBaseUrl, getAuthHeaders } = get();
    if (!uploadedFileData) return;
    
    set({ isLoading: true });
    try {
      const res = await axios.post(
        `${getApiBaseUrl()}/api/v1/file/file-upload?page=${currentPage}`,
        uploadedFileData.formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders(),
          },
          withCredentials: true,
        }
      );
      
      set({ 
        files: res.data.response, 
        totalPages: res.data.total_page || 1 
      });
      
      return res.data;
    } catch (error) {
      console.error('Error fetching uploaded file data:', error);
      toast.error('Failed to fetch uploaded file data.');
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout(navigate);
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Handle file upload
  uploadFile: async (file, logout, navigate) => {
    const { getApiBaseUrl, getAuthHeaders, page } = get();
    
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Validate file type
      if (![
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ].includes(file.type)) {
        toast.error('Only Excel files are allowed.');
        return;
      }

      // Parse and validate Excel data
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      // Extract unique conference names
      const uniqueConferences = Array.from(
        new Set(
          jsonData.map((row) => row.Conference_Name?.trim().toUpperCase())
        )
      ).filter(Boolean);
      
      set({ excludedConferenceNames: uniqueConferences });

      // Validation
      const requiredFields = [
        'Title',
        'Author_Mail',
        'Conference_Name',
        'Decision_With_Comments',
      ];

    //   const allowedDecisions = ["accepted", "revision sent", "rejected", "registered", "sent back to author", "precheck", "1st comments pending", "2nd comments pending", "withdraw"];
      const invalidRows = [];

      jsonData.forEach((row, index) => {
        const missing = requiredFields.filter(
          (field) => !row[field] || String(row[field]).trim() === ''
        );
        
        const decisionValue = row.Decision_With_Comments?.toString().toLowerCase()
        .replace(/[-''"/=.,:;]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
        // const hasInvalidDecision = row.Decision_With_Comments && 
        //   !allowedDecisions.includes(decisionValue);

        // if (missing.length > 0 || hasInvalidDecision) {
        //   const issues = [];
          
        //   if (missing.length > 0) {
        //     issues.push(`Missing fields: ${missing.join(', ')}`);
        //   }
          
        //   if (hasInvalidDecision) {
        //     issues.push(`Invalid Decision_With_Comments value: "${row.Decision_With_Comments}". Allowed values are: ${allowedDecisions.join(', ')}`);
        //   }
          
        //   invalidRows.push({
        //     rowNumber: index + 2,
        //     issues: issues,
        //   });
        // }
      });

      if (invalidRows.length > 0) {
        const issueMessage = invalidRows
          .map(
            (row) =>
              `Paper_ID - ${row.rowNumber}: ${row.issues.join(' | ')}`
          )
          .join('\n');

        set({ validationErrors: issueMessage });
        return { validationError: issueMessage };
      }

      // Start upload
      set({ 
        isUploading: true, 
        uploadingMessage: 'Uploading...' 
      });

      const cancelTokenSource = axios.CancelToken.source();
      set({ cancelTokenSource });

      const uploadResponse = await axios.post(
        `${getApiBaseUrl()}/api/v1/file/file-upload?page=${page}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders(),
          },
          withCredentials: true,
          cancelToken: cancelTokenSource.token,
        }
      );

      set({ uploadingMessage: 'Processing uploaded data...' });

      set({
        uploadedFileData: {
          formData: formData,
          response: uploadResponse.data.response,
        },
        files: uploadResponse.data.response,
        totalPages: uploadResponse.data.total_page,
        isUploaded: true,
        uploadedFileName: file.name,
        selectedFile: null,
        page: 1,
        query: '',
      });

      toast.success('File uploaded successfully!');
      return uploadResponse.data;

    } catch (err) {
      if (axios.isCancel(err)) {
        toast.warn('Upload cancelled.');
      } else {
        console.error('Upload failed:', err);
        toast.error('Upload failed. Please try again.');
        if (err.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          logout(navigate);
        }
      }
      throw err;
    } finally {
      set({ 
        isUploading: false, 
        uploadingMessage: '',
        cancelTokenSource: null 
      });
    }
  },

  // Cancel upload
  cancelUpload: () => {
    const { cancelTokenSource } = get();
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Upload cancelled by user.');
    }
  },

  // Reset upload state
  resetUpload: () => {
    set({
      selectedFile: null,
      isUploaded: false,
      uploadedFileData: null,
      uploadedFileName: '',
      files: [],
      page: 1,
      query: '',
      totalPages: 1,
    });
  },

  // Refresh data
  refreshData: async (logout, navigate) => {
    const { query, page, isUploaded, uploadedFileData, fetchData, fetchUploadedFileData } = get();
    
    set({ isRefreshing: true });
    try {
      if (query.trim()) {
        await fetchData(query, page, logout, navigate);
        toast.success('Search results refreshed!');
      } else if (isUploaded && uploadedFileData) {
        await fetchUploadedFileData(page, logout, navigate);
        toast.success('Uploaded data refreshed!');
      } else {
        await fetchData('', page, logout, navigate);
        toast.success('Database records refreshed!');
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Failed to refresh data. Please try again.');
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout(navigate);
      }
    } finally {
      set({ isRefreshing: false });
    }
  },

  // Fetch all search results with progress
  fetchAllSearchResultsWithProgress: async (searchTerm, cancelToken, logout, navigate) => {
    const { getApiBaseUrl, getAuthHeaders } = get();
    let allData = [];
    let currentPage = 1;
    let hasMore = true;

    const initialRes = await axios.get(
      `${getApiBaseUrl()}/api/v1/file/file-get?q=${searchTerm}&page=1`,
      {
        headers: getAuthHeaders(),
        cancelToken: cancelToken.token,
        withCredentials: true,
      }
    );
    
    const totalPages = initialRes.data.total_page || 1;
    set({ downloadProgress: { current: 0, total: totalPages } });

    while (hasMore && currentPage <= totalPages) {
      try {
        const res = await axios.get(
          `${getApiBaseUrl()}/api/v1/file/file-get?q=${searchTerm}&page=${currentPage}`,
          {
            headers: getAuthHeaders(),
            cancelToken: cancelToken.token,
            withCredentials: true,
          }
        );

        const pageData = res.data.data || [];

        if (pageData.length === 0) {
          hasMore = false;
        } else {
          allData = [...allData, ...pageData];
          set({ downloadProgress: { current: currentPage, total: totalPages } });
          currentPage++;

          if (currentPage > totalPages) {
            hasMore = false;
          }
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          throw error;
        }
        console.error(`Error fetching search results page ${currentPage}:`, error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          logout(navigate);
        }
        throw error;
      }
    }

    return allData;
  },

  // Fetch all response data with progress
  fetchAllResponseDataWithProgress: async (cancelToken, logout, navigate) => {
    const { isUploaded, uploadedFileData, fetchAllDatabaseRecordsWithProgress, getApiBaseUrl, getAuthHeaders } = get();
    
    if (!isUploaded || !uploadedFileData) {
      return await fetchAllDatabaseRecordsWithProgress(cancelToken, logout, navigate);
    }

    let allData = [];
    let currentPage = 1;
    let hasMore = true;

    const initialRes = await axios.post(
      `${getApiBaseUrl()}/api/v1/file/file-upload?page=1`,
      uploadedFileData.formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders(),
        },
        cancelToken: cancelToken.token,
        withCredentials: true,
      }
    );
    
    const totalPages = initialRes.data.total_page || 1;
    set({ downloadProgress: { current: 0, total: totalPages } });

    while (hasMore && currentPage <= totalPages) {
      try {
        const res = await axios.post(
          `${getApiBaseUrl()}/api/v1/file/file-upload?page=${currentPage}`,
          uploadedFileData.formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...getAuthHeaders(),
            },
            cancelToken: cancelToken.token,
            withCredentials: true,
          }
        );

        const pageData = res.data.response || [];

        if (pageData.length === 0) {
          hasMore = false;
        } else {
          allData = [...allData, ...pageData];
          set({ downloadProgress: { current: currentPage, total: totalPages } });
          currentPage++;

          if (currentPage > totalPages) {
            hasMore = false;
          }
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          throw error;
        }
        console.error(`Error fetching response data page ${currentPage}:`, error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          logout(navigate);
        }
        throw error;
      }
    }

    return allData;
  },

  // Fetch all database records with progress
  fetchAllDatabaseRecordsWithProgress: async (cancelToken, logout, navigate) => {
    const { getApiBaseUrl, getAuthHeaders } = get();
    let allData = [];
    let currentPage = 1;
    let hasMore = true;

    const initialRes = await axios.get(
      `${getApiBaseUrl()}/api/v1/file/file-get?q=&page=1`,
      {
        headers: getAuthHeaders(),
        cancelToken: cancelToken.token,
        withCredentials: true,
      }
    );
    
    const totalPages = initialRes.data.total_page || 1;
    set({ downloadProgress: { current: 0, total: totalPages } });

    while (hasMore && currentPage <= totalPages) {
      try {
        const res = await axios.get(
          `${getApiBaseUrl()}/api/v1/file/file-get?q=&page=${currentPage}`,
          {
            headers: getAuthHeaders(),
            cancelToken: cancelToken.token,
            withCredentials: true,
          }
        );

        const pageData = res.data.data || [];

        if (pageData.length === 0) {
          hasMore = false;
        } else {
          allData = [...allData, ...pageData];
          set({ downloadProgress: { current: currentPage, total: totalPages } });
          currentPage++;

          if (currentPage > totalPages) {
            hasMore = false;
          }
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          throw error;
        }
        console.error(`Error fetching database records page ${currentPage}:`, error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          logout(navigate);
        }
        throw error;
      }
    }

    return allData;
  },

  // Download table data
  downloadTableData: async (logout, navigate) => {
    const { 
      query, 
      files, 
      totalPages, 
      fetchAllSearchResultsWithProgress, 
      fetchAllResponseDataWithProgress 
    } = get();

    try {
      set({ 
        isDownloading: true, 
        downloadProgress: { current: 0, total: 0 } 
      });

      const cancelToken = axios.CancelToken.source();
      set({ downloadCancelToken: cancelToken });

      toast.info('Starting download preparation...', { autoClose: 1000 });

      let allData = [];

      if (query.trim()) {
        allData = await fetchAllSearchResultsWithProgress(query, cancelToken, logout, navigate);
      } else {
        allData = files;
        if (totalPages > 1) {
          allData = await fetchAllResponseDataWithProgress(cancelToken, logout, navigate);
        }
      }

      if (!Array.isArray(allData) || allData.length === 0) {
        toast.error('No data to download.');
        return;
      }

      // Process and group data
      const groupedData = new Map();

      allData.forEach((file) => {
        const title = file?.Title || '';

        if (Array.isArray(file?.Conference) && file.Conference.length > 0) {
          file.Conference.forEach((conf) => {
            if (!groupedData.has(title)) {
              groupedData.set(title, {
                Title: title,
                Conference_Names: [],
                Decision_With_Comments: [],
                Precheck_Comments: [],
                Firstset_Comments: [],
              });
            }

            const group = groupedData.get(title);

            const confName = conf?.Conference_Name || '';
            if (confName && !group.Conference_Names.includes(confName)) {
              group.Conference_Names.push(confName);
            }

            const decisionComment = conf?.Decision_With_Comments || '';
            if (decisionComment && !group.Decision_With_Comments.includes(decisionComment)) {
              group.Decision_With_Comments.push(decisionComment);
            }

            const precheckComment = conf?.Precheck_Comments || '';
            if (precheckComment && !group.Precheck_Comments.includes(precheckComment)) {
              group.Precheck_Comments.push(precheckComment);
            }

            const firstsetComment = conf?.Firstset_Comments || '';
            if (firstsetComment && !group.Firstset_Comments.includes(firstsetComment)) {
              group.Firstset_Comments.push(firstsetComment);
            }
          });
        } else {
          if (!groupedData.has(title)) {
            groupedData.set(title, {
              Title: title,
              Conference_Names: ['No Conference Data'],
              Decision_With_Comments: [''],
              Precheck_Comments: [''],
              Firstset_Comments: [''],
            });
          }
        }
      });

      const exportData = Array.from(groupedData.values()).map((group) => ({
        Title: group.Title,
        Conference_Name: group.Conference_Names.join(', '),
        Decision_With_Comments: group.Decision_With_Comments.join(', '),
        Precheck_Comments: group.Precheck_Comments.join(', '),
        Firstset_Comments: group.Firstset_Comments.join(', '),
      }));

      // Export to Excel
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Response Data');

      const fileName = query.trim()
        ? `Search_Results_${new Date().toISOString().split('T')[0]}.xlsx`
        : `Response_Data_${new Date().toISOString().split('T')[0]}.xlsx`;

      XLSX.writeFile(wb, fileName);
      toast.success(
        `Download completed! ${exportData.length} records exported successfully.`,
        { autoClose: 5000 }
      );

    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      } else {
        console.error('Download error:', error);
        toast.error('❌ Failed to download data. Please try again.');
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          logout(navigate);
        }
      }
    } finally {
      set({ 
        isDownloading: false, 
        downloadProgress: { current: 0, total: 0 }, 
        downloadCancelToken: null 
      });
    }
  },

  // Cancel download
  cancelDownload: () => {
    const { downloadCancelToken } = get();
    if (downloadCancelToken) {
      downloadCancelToken.cancel('Download cancelled by user.');
    }
  },
}));

export default useFileStore;