// API Service for Panchakarma Management Platform
class PanchakarmaAPI {
  constructor() {
    this.baseURL = window.location.origin + '/api';
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Get headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication API
  async login(email, password, userType) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, userType }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Patient API
  async getPatientProfile() {
    return this.request('/patients/me');
  }

  async updatePatientProfile(profileData) {
    return this.request('/patients/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getPatientAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/patients/me/appointments?${queryString}`);
  }

  async getPatientProgress() {
    return this.request('/patients/me/progress');
  }

  async assignPractitioner(practitionerId) {
    return this.request('/patients/me/assign-practitioner', {
      method: 'POST',
      body: JSON.stringify({ practitionerId }),
    });
  }

  // Patient Details API
  async getPatientDetails(patientId) {
    return this.request(`/patient-details/${patientId}`);
  }

  async addPatientImprovement(patientId, improvementData) {
    return this.request(`/patient-details/${patientId}/improvements`, {
      method: 'POST',
      body: JSON.stringify(improvementData),
    });
  }

  async updatePatientDetails(patientId, detailsData) {
    return this.request(`/patient-details`, {
      method: 'POST', // This route is POST for create/update
      body: JSON.stringify({ patientId, ...detailsData }),
    });
  }

  async addPatientProblem(patientId, problemData) {
    return this.request(`/patient-details/${patientId}/problems`, {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
  }

  async addPatientImprovement(patientId, improvementData) {
    return this.request(`/patient-details/${patientId}/improvements`, {
      method: 'POST',
      body: JSON.stringify(improvementData),
    });
  }

  async addPatientVitalSigns(patientId, vitalSignsData) {
    return this.request(`/patient-details/${patientId}/vital-signs`, {
      method: 'POST',
      body: JSON.stringify(vitalSignsData),
    });
  }

  async addPatientNote(patientId, noteData) {
    // Assuming a route for adding notes to patient details
    // This might need to be created in the backend if not already present
    return this.request(`/patient-details/${patientId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  // Practitioner API
  async getPractitionerProfile() {
    return this.request('/practitioners/me');
  }

  async getPatient(patientId) {
    return this.request(`/patients/${patientId}`);
  }

  async updatePractitionerProfile(profileData) {
    return this.request('/practitioners/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getPractitionerPatients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/practitioners/me/patients?${queryString}`);
  }

  async getPractitionerAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/practitioners/me/appointments?${queryString}`);
  }

  async getPractitionerAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/practitioners/me/analytics?${queryString}`);
  }

  async assignPatient(patientId) {
    return this.request('/practitioners/me/assign-patient', {
      method: 'POST',
      body: JSON.stringify({ patientId }),
    });
  }

  // Wallet API
  async getWalletBalance() {
    return this.request('/wallet/balance');
  }

  async addFunds(paymentData) {
    return this.request('/wallet/add-funds', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async deductFunds(deductionData) {
    return this.request('/wallet/deduct', {
      method: 'POST',
      body: JSON.stringify(deductionData),
    });
  }

  async getTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/wallet/transactions?${queryString}`);
  }

  // Appointment API
  async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/appointments?${queryString}`);
  }

  async getAppointment(id) {
    return this.request(`/appointments/${id}`);
  }

  async updateAppointment(id, appointmentData) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointmentStatus(id, status, cancellationReason = null) {
    return this.request(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, cancellationReason }),
    });
  }

  async cancelAppointment(id) {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Therapy API
  async getTherapies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/therapies?${queryString}`);
  }

  async getTherapy(id) {
    return this.request(`/therapies/${id}`);
  }

  async getTherapyTypes() {
    return this.request('/therapies/types/list');
  }

  // Feedback API
  async submitFeedback(feedbackData) {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  async getFeedback(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/feedback?${queryString}`);
  }

  async getFeedbackAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/feedback/analytics/summary?${queryString}`);
  }

  // Notification API
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notifications?${queryString}`);
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async getNotificationStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notifications/stats?${queryString}`);
  }

  // Utility methods
  async checkHealth() {
    return this.request('/health');
  }

  // Error handling
  handleError(error) {
    console.error('API Error:', error);
    
    if (error.message.includes('401') || error.message.includes('Invalid token')) {
      this.removeToken();
      window.location.href = '/index.html';
      return;
    }

    // Show user-friendly error message
    this.showError(error.message || 'An error occurred. Please try again.');
  }

  showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
      <div class="error-content">
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#error-styles')) {
      const style = document.createElement('style');
      style.id = 'error-styles';
      style.textContent = `
        .error-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 8px;
          padding: 1rem;
          z-index: 10000;
          max-width: 400px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .error-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .error-content i {
          color: #c33;
        }
        .error-content button {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #666;
          margin-left: auto;
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
    }, 5000);
  }
}

// Create global API instance
window.api = new PanchakarmaAPI();

// Auto-login if token exists
document.addEventListener('DOMContentLoaded', async () => {
  if (window.api.token) {
    try {
      const response = await window.api.getProfile();
      if (response.success) {
        window.currentUser = response.data.user;
        updateUIForLoggedInUser();
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
      window.api.removeToken();
    }
  }
});

// Update UI for logged-in user
function updateUIForLoggedInUser() {
  if (window.currentUser) {
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      if (link.textContent.includes('Login')) {
        link.textContent = 'Dashboard';
        link.href = window.currentUser.role === 'patient' ? 'patient-dashboard.html' : 'practitioner-dashboard.html';
      }
    });

    // Update dashboard titles
    const dashboardTitles = document.querySelectorAll('.dashboard-title');
    dashboardTitles.forEach(title => {
      if (title.textContent.includes('Welcome back')) {
        title.textContent = `Welcome back, ${window.currentUser.firstName}!`;
      }
    });
  }
}
