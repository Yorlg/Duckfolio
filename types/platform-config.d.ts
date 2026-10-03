export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

export interface WebsiteLink {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface ProjectLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
}

export interface ProjectSection {
  id: string;
  title: string;
  projects: ProjectLink[];
}

export interface Profile {
  avatar: string;
  name: string;
  bio: string;
  style?: 'classic' | 'minimal';
  theme?: { avatar: string; primary: string; secondary: string };
}

export interface ProfileConfig {
  profile: Profile;
  projectSections?: ProjectSection[];
  socialLinks: SocialLink[];
  websiteLinks: WebsiteLink[];
}
