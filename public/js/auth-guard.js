// Global Authentication Guard
class AuthGuard {
    constructor() {
        this.checkAuth();
        this.setupLogoutHandlers();
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!token || !user._id) {
            this.redirectToLogin();
            return false;
        }

        // Verify token is still valid
        this.verifyToken(token).then(isValid => {
            if (!isValid) {
                this.clearAuth();
                this.redirectToLogin();
            }
        }).catch(() => {
            this.clearAuth();
            this.redirectToLogin();
        });

        return true;
    }

    async verifyToken(token) {
        try {
            const response = await fetch('/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    }

    redirectToLogin() {
        // Store current page for redirect after login
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = 'login.html';
    }

    clearAuth() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        localStorage.removeItem('loginTime');
    }

    setupLogoutHandlers() {
        // Add logout confirmation to all logout buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[onclick*="logout"]') || e.target.closest('[onclick*="logout"]')) {
                e.preventDefault();
                this.confirmLogout();
            }
        });
    }

    async confirmLogout() {
        const confirmed = confirm('Are you sure you want to logout?');
        if (confirmed) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                }
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                this.clearAuth();
                window.location.href = 'login.html';
            }
        }
    }

    // Log user activity
    async logActivity(action, details = {}) {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await fetch('/api/auth/log-activity', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    details: {
                        ...details,
                        page: window.location.pathname,
                        timestamp: new Date().toISOString()
                    }
                })
            });
        } catch (error) {
            console.error('Activity logging error:', error);
        }
    }

    // Check if user has required role
    hasRole(requiredRole) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role === requiredRole;
    }

    // Redirect if user doesn't have required role
    requireRole(requiredRole, redirectTo = 'login.html') {
        if (!this.hasRole(requiredRole)) {
            alert(`Access denied. This page requires ${requiredRole} privileges.`);
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }
}

// Initialize auth guard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.authGuard = new AuthGuard();
    
    // Log page view
    window.authGuard.logActivity('page_view', {
        page: window.location.pathname,
        referrer: document.referrer
    });
});

// Override the global logout function
function logout() {
    if (window.authGuard) {
        window.authGuard.confirmLogout();
    }
}
