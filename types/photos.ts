export interface Photo {
  id: string;
  src: string;
  alt: string;
}

export interface AdminPhoto extends Photo {
  hidden: boolean;
}
