export interface User {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  name: string;
}