export enum ProjectStatus {
  UPCOMING = "UPCOMING",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
}

export interface IProject {
  title: string;
  name: string;
  description: string;
  details: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  year?: string;
  location: string;
  picture?: string;
  gallery?: string[];
  client: string;
}
