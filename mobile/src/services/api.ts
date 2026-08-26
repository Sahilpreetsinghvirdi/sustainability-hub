// mobile/src/services/api.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { config } from '@/constants/config';
import { useAuthStore } from '@/store/authStore';
import { useCarbonStore } from '@/store/carbonStore';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const tokens = useAuthStore.getState().tokens;
        if (tokens?.access_token) {
          config.headers.Authorization = `Bearer ${tokens.access_token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            useAuthStore.getState().logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const { tokens, setTokens, logout } = useAuthStore.getState();
      if (!tokens?.refresh_token) {
        logout();
        throw new Error('No refresh token');
      }

      const response = await axios.post(
        `${config.api.baseUrl}/auth/refresh`,
        { refresh_token: tokens.refresh_token },
        { timeout: config.api.timeout }
      );

      const newTokens = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
      };

      setTokens(newTokens);
      return newTokens.access_token;
    })();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any, options?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, options);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  async upload<T>(url: string, file: { uri: string; name: string; type: string }, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file as any);

    const response = await this.client.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    return response.data;
  }
}

export const api = new ApiClient();

class AuthService {
  async register(data: { email: string; password: string; name: string }) {
    return api.post('/auth/register', data);
  }

  async login(email: string, password: string) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  async refreshToken(refreshToken: string) {
    return api.post('/auth/refresh', { refresh_token: refreshToken });
  }

  async logout() {
    return api.post('/auth/logout');
  }

  async getMe() {
    return api.get('/auth/me');
  }

  async forgotPassword(email: string) {
    return api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string) {
    return api.post('/auth/reset-password', { token, new_password: newPassword });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword });
  }
}

class CarbonService {
  async getScans(params?: { page?: number; startDate?: string; endDate?: string; status?: string }) {
    return api.get('/carbon/scans', params);
  }

  async getScanById(id: string) {
    return api.get(`/carbon/scans/${id}`);
  }

  async getScanItems(scanId: string) {
    return api.get(`/carbon/scans/${scanId}/items`);
  }

  async scanReceipt(imageUri: string, metadata?: { store_name?: string; total_amount?: number; currency?: string }) {
    const file = {
      uri: imageUri,
      name: `receipt_${Date.now()}.jpg`,
      type: 'image/jpeg',
    };
    return api.upload('/carbon/scan', file, (progress) => {
      useCarbonStore.getState().setScanProgress(progress);
    });
  }

  async createManualReceipt(data: any) {
    return api.post('/carbon/scan/manual', data);
  }

  async updateItem(itemId: string, updates: any) {
    return api.patch(`/carbon/scans/items/${itemId}`, updates);
  }

  async getFactors(category?: string, region = 'US') {
    return api.get('/carbon/factors', { category, region });
  }

  async getSummary(period = 'month', startDate?: string) {
    return api.get('/carbon/summary', { period, start_date: startDate });
  }
}

class EnergyService {
  async getBills(params?: { page?: number; startDate?: string; endDate?: string }) {
    return api.get('/energy/bills', params);
  }

  async getBillById(id: string) {
    return api.get(`/energy/bills/${id}`);
  }

  async processBill(imageUri: string, provider?: string) {
    const file = {
      uri: imageUri,
      name: `bill_${Date.now()}.jpg`,
      type: 'image/jpeg',
    };
    return api.upload('/energy/bills', file);
  }

  async createManualBill(data: any) {
    return api.post('/energy/bills/manual', data);
  }

  async getAppliances() {
    return api.get('/energy/appliances');
  }

  async createAppliance(data: any) {
    return api.post('/energy/appliances', data);
  }

  async updateAppliance(id: string, data: any) {
    return api.patch(`/energy/appliances/${id}`, data);
  }

  async deleteAppliance(id: string) {
    return api.delete(`/energy/appliances/${id}`);
  }

  async generateAudit() {
    return api.post('/energy/audit');
  }

  async getAudits() {
    return api.get('/energy/audits');
  }

  async getRecommendations() {
    return api.get('/energy/recommendations');
  }

  async getSummary(period = 'month') {
    return api.get('/dashboard/summary', { period });
  }
}

class FoodWasteService {
  async getLogs(params?: { page?: number; mealType?: string; startDate?: string; endDate?: string }) {
    return api.get('/food-waste/logs', params);
  }

  async getLogById(id: string) {
    return api.get(`/food-waste/logs/${id}`);
  }

  async processLog(mealImageUri: string, wasteImageUri: string, mealType: string) {
    const mealFile = {
      uri: mealImageUri,
      name: `meal_${Date.now()}.jpg`,
      type: 'image/jpeg',
    };
    const wasteFile = {
      uri: wasteImageUri,
      name: `waste_${Date.now()}.jpg`,
      type: 'image/jpeg',
    };

    const formData = new FormData();
    formData.append('meal_image', mealFile as any);
    formData.append('waste_image', wasteFile as any);
    formData.append('meal_type', mealType);

    return api.post('/food-waste/logs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async createManualLog(data: any) {
    return api.post('/food-waste/logs/manual', data);
  }

  async getStreak() {
    return api.get('/food-waste/streak');
  }

  async getSummary(period = 'month', startDate?: string) {
    return api.get('/food-waste/summary', { period, start_date: startDate });
  }
}

class DashboardService {
  async getSummary(period = 'month', startDate?: string) {
    return api.get('/dashboard/summary', { period, start_date: startDate });
  }

  async getTrends(metric = 'carbon', period = 'month') {
    return api.get('/dashboard/trends', { period, metric });
  }

  async getInsights() {
    return api.get('/dashboard/insights');
  }

  async getAchievements() {
    return api.get('/dashboard/achievements');
  }
}

class SyncService {
  async getStatus() {
    return api.get('/sync/status');
  }

  async pushChanges(changes: any[]) {
    return api.post('/sync/push', { changes });
  }

  async pullChanges(since: Date) {
    return api.post('/sync/pull', { since: since.toISOString() });
  }

  async resolveConflicts(conflicts: any[]) {
    return api.post('/sync/resolve-conflicts', { conflicts });
  }
}

class HouseholdService {
  async create(data: any) {
    return api.post('/households', data);
  }

  async getMyHousehold() {
    return api.get('/households/me');
  }

  async update(data: any) {
    return api.patch('/households/me', data);
  }

  async getMembers() {
    return api.get('/households/me/members');
  }

  async invite(data: { email: string; role: string }) {
    return api.post('/households/me/invite', data);
  }

  async removeMember(userId: string) {
    return api.delete(`/households/me/members/${userId}`);
  }

  async leave() {
    return api.post('/households/me/leave');
  }
}

class UserService {
  async getProfile() {
    return api.get('/users/me');
  }

  async updateProfile(data: any) {
    return api.patch('/users/me', data);
  }

  async updatePreferences(data: any) {
    return api.patch('/users/me/preferences', data);
  }

  async deleteAccount() {
    return api.delete('/users/me');
  }
}

export const authService = new AuthService();
export const carbonService = new CarbonService();
export const energyService = new EnergyService();
export const foodWasteService = new FoodWasteService();
export const dashboardService = new DashboardService();
export const syncService = new SyncService();
export const householdService = new HouseholdService();
export const userService = new UserService();
