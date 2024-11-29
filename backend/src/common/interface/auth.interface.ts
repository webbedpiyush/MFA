export interface RegisterDataType {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userAgent?: string;
}

export interface LoginDataType {
  email: string;
  password: string;
  userAgent?: string;
}
