export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  relationship: string;
}

// Mock user data - in real app this would come from your database
export const getCurrentUserInfo = async (): Promise<UserInfo> => {
  // Simulating API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    id: 'user_123',
    fullName: 'Johnas Lee',
    email: 'johnaslee@gmail.com',
    phone: '0123456789',
    relationship: 'Parent',
  };
};
