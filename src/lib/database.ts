import { apiService } from './apiService';

// Export the API service as the database interface
export function getDatabase() {
  return apiService;
}

export default apiService;