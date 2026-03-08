export enum ProjectStatus {
  UPCOMING = "UPCOMING",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
}

export type TUpdateProjectPayload = Partial<IProject> & {
  removeGallery?: string[];
};

export interface IProject {
  title: string;
  name: string;
  description: string;
  objective?: string;
  responsibility?: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  year?: string;
  location: string;
  picture?: string;
  gallery?: string[];
  client: string;
}
