import { supabase } from './supabaseClient';
import { toast } from 'sonner';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  created_at: string;
  last_login: string | null;
  is_active: boolean;
  login_attempts?: number;
  locked_until?: string | null;
}

export interface AdminSession {
  user: AdminUser;
  token: string;
  expires_at: string;
  session_id?: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: AdminUser;
}

class AdminService {
  private currentSession: AdminSession | null = null;
  private readonly SESSION_KEY = 'scan2tap_admin_session';
  private readonly TOKEN_EXPIRY_HOURS = 8; // 8 hour sessions
  private sessionValidationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadSession();
    this.startSessionValidation();
  }

  /**
   * Generate secure session token
   */
  private generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get client IP address (best effort)
   */
  private getClientIP(): string | null {
    // This is a best-effort approach for client-side IP detection
    // In production, you might want to use a service or server-side detection
    return null;
  }

  /**
   * Get user agent
   */
  private getUserAgent(): string {
    return navigator.userAgent;
  }

  /**
   * Database-based login with enhanced security
   */
  async login(username: string, password: string): Promise<LoginResult> {
    try {
      // First try database authentication
      const dbResult = await this.databaseLogin(username, password);
      if (dbResult.success) {
        return dbResult;
      }

      // Fallback to environment variables if database fails
      console.warn('Database login failed, falling back to environment variables');
      return await this.environmentLogin(username, password);
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  /**
   * Database authentication using Supabase functions
   */
  private async databaseLogin(username: string, password: string): Promise<LoginResult> {
    try {
      // Call the verify_admin_login function
      const { data, error } = await supabase.rpc('verify_admin_login' as any, {
        p_username: username,
        p_password: password
      });

      if (error) {
        console.error('Database login error:', error);
        throw error;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        return { success: false, error: 'Invalid credentials' };
      }

      const loginResult = data[0];

      if (!loginResult.login_success) {
        return { success: false, error: loginResult.error_message || 'Login failed' };
      }

      // Create admin user object
      const adminUser: AdminUser = {
        id: loginResult.admin_id,
        username: loginResult.username,
        email: loginResult.email,
        role: loginResult.role,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        is_active: loginResult.is_active
      };

      // Create session in database and locally
      await this.createDatabaseSession(adminUser);
      
      return { success: true, user: adminUser };
    } catch (error) {
      console.error('Database login error:', error);
      throw error;
    }
  }

  /**
   * Fallback environment-based authentication
   */
  private async environmentLogin(username: string, password: string): Promise<LoginResult> {
    const envUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

    if (username === envUsername && password === envPassword) {
      const adminUser: AdminUser = {
        id: 'env-admin-' + Date.now(),
        username: envUsername,
        email: 'admin@scan2tap.com',
        role: 'super_admin',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        is_active: true
      };

      this.createLocalSession(adminUser);
      return { success: true, user: adminUser };
    }

    return { success: false, error: 'Invalid credentials' };
  }

  /**
   * Create session in database
   */
  private async createDatabaseSession(user: AdminUser) {
    const token = this.generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);

    try {
      // Create session in database
      const { data: sessionId, error } = await supabase.rpc('create_admin_session' as any, {
        p_admin_id: user.id,
        p_session_token: token,
        p_expires_at: expiresAt.toISOString(),
        p_ip_address: this.getClientIP(),
        p_user_agent: this.getUserAgent()
      });

      if (error) {
        console.error('Error creating database session:', error);
        // Fall back to local session
        this.createLocalSession(user);
        return;
      }

      // Create local session
      this.currentSession = {
        user,
        token,
        expires_at: expiresAt.toISOString(),
        session_id: typeof sessionId === 'string' ? sessionId : undefined
      };

      this.saveSession();
      toast.success(`Welcome back, ${user.username}!`);
    } catch (error) {
      console.error('Error creating database session:', error);
      // Fall back to local session
      this.createLocalSession(user);
    }
  }

  /**
   * Create local session (fallback)
   */
  private createLocalSession(user: AdminUser) {
    const token = this.generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);

    this.currentSession = {
      user,
      token,
      expires_at: expiresAt.toISOString()
    };

    this.saveSession();
    toast.success(`Welcome back, ${user.username}!`);
  }

  /**
   * Validate session against database
   */
  private async validateDatabaseSession(): Promise<boolean> {
    if (!this.currentSession?.token) return false;

    try {
      const { data, error } = await supabase.rpc('validate_admin_session' as any, {
        p_session_token: this.currentSession.token
      });

      if (error || !data || !Array.isArray(data) || data.length === 0) {
        return false;
      }

      const sessionData = data[0];
      if (!sessionData.is_valid) {
        return false;
      }

      // Update user data if needed
      if (this.currentSession.user.id === sessionData.admin_id) {
        this.currentSession.user = {
          ...this.currentSession.user,
          username: sessionData.username,
          email: sessionData.email,
          role: sessionData.role
        };
        this.saveSession();
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
   * Logout and cleanup
   */
  async logout() {
    if (this.currentSession?.session_id) {
      try {
        // Invalidate database session using raw SQL
        await supabase
          .from('admin_sessions' as any)
          .update({ is_active: false } as any)
          .eq('id', this.currentSession.session_id);
      } catch (error) {
        console.error('Error invalidating database session:', error);
      }
    }

    this.currentSession = null;
    localStorage.removeItem(this.SESSION_KEY);
    
    if (this.sessionValidationInterval) {
      clearInterval(this.sessionValidationInterval);
      this.sessionValidationInterval = null;
    }

    toast.success('Logged out successfully');
  }

  /**
   * Check if current session is valid
   */
  async isAuthenticated(): Promise<boolean> {
    if (!this.currentSession) return false;
    
    const now = new Date();
    const expiresAt = new Date(this.currentSession.expires_at);
    
    if (now >= expiresAt) {
      await this.logout();
      return false;
    }

    // For database sessions, validate against database periodically
    if (this.currentSession.session_id) {
      const isValid = await this.validateDatabaseSession();
      if (!isValid) {
        await this.logout();
        return false;
      }
    }
    
    return true;
  }

  /**
   * Synchronous authentication check (for immediate UI updates)
   */
  isAuthenticatedSync(): boolean {
    if (!this.currentSession) return false;
    
    const now = new Date();
    const expiresAt = new Date(this.currentSession.expires_at);
    
    return now < expiresAt;
  }

  /**
   * Get current admin user
   */
  getCurrentUser(): AdminUser | null {
    return this.currentSession?.user || null;
  }

  /**
   * Get session time remaining in minutes
   */
  getSessionTimeRemaining(): number {
    if (!this.currentSession) return 0;
    
    const now = new Date();
    const expiresAt = new Date(this.currentSession.expires_at);
    const diffMs = expiresAt.getTime() - now.getTime();
    
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  }

  /**
   * Save session to localStorage
   */
  private saveSession() {
    if (this.currentSession) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
    }
  }

  /**
   * Load session from localStorage
   */
  private loadSession() {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (sessionData) {
        this.currentSession = JSON.parse(sessionData);
        
        // Check if session is still valid (sync check)
        if (!this.isAuthenticatedSync()) {
          this.currentSession = null;
          localStorage.removeItem(this.SESSION_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  /**
   * Extend current session
   */
  async extendSession() {
    if (!this.currentSession) return;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);
    this.currentSession.expires_at = expiresAt.toISOString();

    // Update database session if it exists
    if (this.currentSession.session_id) {
      try {
        await supabase
          .from('admin_sessions' as any)
          .update({ expires_at: expiresAt.toISOString() } as any)
          .eq('id', this.currentSession.session_id);
      } catch (error) {
        console.error('Error extending database session:', error);
      }
    }

    this.saveSession();
    toast.success('Session extended successfully');
  }

  /**
   * Check if session needs renewal (less than 30 minutes remaining)
   */
  needsRenewal(): boolean {
    return this.getSessionTimeRemaining() < 30;
  }

  /**
   * Start periodic session validation
   */
  private startSessionValidation() {
    // Validate session every 5 minutes
    this.sessionValidationInterval = setInterval(async () => {
      if (this.currentSession) {
        const isValid = await this.isAuthenticated();
        if (!isValid) {
          toast.error('Session expired. Please log in again.');
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Admin management functions (simplified for now)
   */

  /**
   * Create new admin user (super_admin only)
   */
  async createAdminUser(userData: {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'moderator';
  }): Promise<{ success: boolean; error?: string; userId?: string }> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    try {
      // Generate salt and hash password
      const salt = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      
      const encoder = new TextEncoder();
      const data = encoder.encode(userData.password + salt);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const passwordHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      // Use raw SQL to insert admin user (bypassing TypeScript issues)
      const { data: result, error } = await supabase
        .rpc('create_admin_user' as any, {
          p_username: userData.username,
          p_email: userData.email,
          p_password_hash: passwordHash,
          p_salt: salt,
          p_role: userData.role,
          p_created_by: currentUser.id
        });

      if (error) {
        console.error('Error creating admin user:', error);
        return { success: false, error: 'Failed to create admin user. Make sure the database is set up correctly.' };
      }

      return { success: true, userId: result };
    } catch (error) {
      console.error('Error creating admin user:', error);
      return { success: false, error: 'Failed to create admin user. Database may not be set up yet.' };
    }
  }

  /**
   * Get all admin users (super_admin only)
   */
  async getAdminUsers(): Promise<AdminUser[]> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return [];
    }

    try {
      const { data, error } = await supabase
        .rpc('get_admin_users' as any);

      if (error) {
        console.error('Error fetching admin users:', error);
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  }

  /**
   * Update admin user status
   */
  async updateAdminUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return false;
    }

    try {
      const { error } = await supabase
        .rpc('update_admin_user_status' as any, {
          p_user_id: userId,
          p_is_active: isActive
        });

      if (error) {
        console.error('Error updating admin user status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating admin user status:', error);
      return false;
    }
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_admin_sessions' as any);
      
      if (error) {
        console.error('Error cleaning up sessions:', error);
        return 0;
      }

      return typeof data === 'number' ? data : 0;
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();

// SQL function to create admin tables (to be run in Supabase)
export const CREATE_ADMIN_TABLES_SQL = `
CREATE OR REPLACE FUNCTION create_admin_tables()
RETURNS void AS $$
BEGIN
  -- Create admin_users table if it doesn't exist
  CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
  );

  -- Create index on username for faster lookups
  CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
  
  -- Create index on email for faster lookups
  CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

  -- Enable RLS
  ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

  -- Create policy for admin access only
  CREATE POLICY IF NOT EXISTS "Admin users can manage admin_users" ON admin_users
    FOR ALL USING (auth.role() = 'service_role');

END;
$$ LANGUAGE plpgsql;
`; 