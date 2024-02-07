import { IOption } from "./types.ts";

export const initialOptions: IOption[] = [
  {
    id: "1.1",
    parentId: null,
  },
  {
    id: "1.2",
    parentId: null,
  },
  {
    id: "2.1",
    parentId: "1.1",
  },
  {
    id: "2.2",
    parentId: "1.2",
  },
  {
    id: "3.1",
    parentId: "2.1",
  },
  {
    id: "3.2",
    parentId: "2.2",
  },
  {
    id: "4.1",
    parentId: "3.1",
  },
  {
    id: "4.2",
    parentId: "3.2",
  },
  {
    id: "5.1",
    parentId: "4.1",
  },
  {
    id: "5.2",
    parentId: "4.2",
  },
];
