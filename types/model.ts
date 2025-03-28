export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  served_by: string;
}

export interface ListModelsResponse {
  object: string;
  data: Model[];
}
