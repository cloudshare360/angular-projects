export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  inProgressTodos: number;
  overdueTodos: number;
  systemHealth: SystemHealth;
  lastUpdated: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: string;
  lastBackup: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: 'todo' | 'user' | 'category';
  entityId: string;
  details: any;
  timestamp: string;
  ipAddress: string;
}

export interface UserManagement {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}
