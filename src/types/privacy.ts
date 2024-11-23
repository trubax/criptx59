export interface PrivacySettings {
  accountType: 'public' | 'private';
  profileVisibility: 'public' | 'contacts' | 'private';
  showLastSeen: boolean;
  showStatus: boolean;
  showBio: boolean;
  showPosts: boolean;
  showServices: boolean;
  whoCanMessageMe: 'everyone' | 'followers' | 'none';
  whoCanSeeMyPosts: 'everyone' | 'followers' | 'none';
  blockedUsers: string[];
  closeFollowers: string[];
} 