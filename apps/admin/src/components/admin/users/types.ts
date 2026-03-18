export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  allowedModules: string | null;
  createdAt: Date;
};
