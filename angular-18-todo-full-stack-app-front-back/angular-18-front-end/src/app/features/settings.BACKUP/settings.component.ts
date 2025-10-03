import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 'sunday' | 'monday';
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  dueDateReminders: boolean;
  collaborationNotifications: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showStats: boolean;
  allowDataAnalytics: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  activeTab: 'general' | 'notifications' | 'privacy' | 'data' = 'general';

  appSettings: AppSettings = {
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 'sunday'
  };

  notificationSettings: NotificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    dailyDigest: false,
    weeklyReport: true,
    dueDateReminders: true,
    collaborationNotifications: true
  };

  privacySettings: PrivacySettings = {
    profileVisibility: 'public',
    showEmail: false,
    showStats: true,
    allowDataAnalytics: true
  };

  languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' }
  ];

  dateFormats = [
    'MM/DD/YYYY',
    'DD/MM/YYYY',
    'YYYY-MM-DD',
    'DD.MM.YYYY'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    // Load from localStorage or backend
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      this.appSettings = JSON.parse(savedSettings);
    }

    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      this.notificationSettings = JSON.parse(savedNotifications);
    }

    const savedPrivacy = localStorage.getItem('privacySettings');
    if (savedPrivacy) {
      this.privacySettings = JSON.parse(savedPrivacy);
    }
  }

  setActiveTab(tab: 'general' | 'notifications' | 'privacy' | 'data'): void {
    this.activeTab = tab;
  }

  saveGeneralSettings(): void {
    localStorage.setItem('appSettings', JSON.stringify(this.appSettings));

    // Apply theme
    this.applyTheme();

    alert('General settings saved successfully!');
  }

  applyTheme(): void {
    const root = document.documentElement;

    if (this.appSettings.theme === 'dark') {
      root.classList.add('dark-theme');
    } else if (this.appSettings.theme === 'light') {
      root.classList.remove('dark-theme');
    } else {
      // Auto - check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark-theme');
      } else {
        root.classList.remove('dark-theme');
      }
    }
  }

  saveNotificationSettings(): void {
    localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
    alert('Notification settings saved successfully!');
  }

  savePrivacySettings(): void {
    localStorage.setItem('privacySettings', JSON.stringify(this.privacySettings));
    alert('Privacy settings saved successfully!');
  }

  exportData(): void {
    // Create data export
    const exportData = {
      settings: {
        app: this.appSettings,
        notifications: this.notificationSettings,
        privacy: this.privacySettings
      },
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `todo-app-data-${new Date().getTime()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    alert('Data exported successfully!');
  }

  importData(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const importedData = JSON.parse(e.target.result);

        if (importedData.settings) {
          if (importedData.settings.app) {
            this.appSettings = importedData.settings.app;
            localStorage.setItem('appSettings', JSON.stringify(this.appSettings));
          }
          if (importedData.settings.notifications) {
            this.notificationSettings = importedData.settings.notifications;
            localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
          }
          if (importedData.settings.privacy) {
            this.privacySettings = importedData.settings.privacy;
            localStorage.setItem('privacySettings', JSON.stringify(this.privacySettings));
          }
        }

        alert('Data imported successfully!');
        this.applyTheme();
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  }

  clearAllData(): void {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      alert('All data cleared successfully!');
      this.loadSettings();
    }
  }

  resetToDefaults(): void {
    if (confirm('Reset all settings to default values?')) {
      this.appSettings = {
        theme: 'light',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        firstDayOfWeek: 'sunday'
      };

      this.notificationSettings = {
        emailNotifications: true,
        pushNotifications: true,
        taskReminders: true,
        dailyDigest: false,
        weeklyReport: true,
        dueDateReminders: true,
        collaborationNotifications: true
      };

      this.privacySettings = {
        profileVisibility: 'public',
        showEmail: false,
        showStats: true,
        allowDataAnalytics: true
      };

      localStorage.removeItem('appSettings');
      localStorage.removeItem('notificationSettings');
      localStorage.removeItem('privacySettings');

      alert('Settings reset to defaults!');
      this.applyTheme();
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
