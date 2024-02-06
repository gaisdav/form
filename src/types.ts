export interface IOption {
  id: string;
  parentId: string | null;
}

export interface IDataSource {
  key: number;
}

export interface ISelectChangeParams {
  cellId: string;
  value: string;
  level: number;
  row: number;
}

export interface ISelectOpenParams {
  cellId: string;
  parentId: string | null;
}
