import { Types } from 'mongoose';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { authenticatedFetch } from '../../authentication/authenticatedFetch';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

interface UserProfile {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  optin?: boolean;
}

interface UserPassword {
  password?: string;
  formerPassword?: string;
}

export type User = UserProfile &
  UserPassword & { role: Role } & { _id: Types.ObjectId, optin?: boolean };

const getUser = async (): Promise<User> => {
  const response = await authenticatedFetch(
    `${process.env.REACT_APP_API_URL}/authentication/me`,
    {
      method: 'GET',
    },
  );
  return await response.json();
};

const changeProfile = async (user: UserProfile): Promise<User> => {
  const response = await authenticatedFetch(
    `${process.env.REACT_APP_API_URL}/authentication/me`,
    {
      method: 'PUT',
      body: JSON.stringify(user),
    },
  );
  return await response.json();
};

const changePassword = async (user: UserPassword): Promise<User> => {
  const response = await authenticatedFetch(
    `${process.env.REACT_APP_API_URL}/authentication/me`,
    {
      method: 'PUT',
      body: JSON.stringify(user),
    },
  );
  return await response.json();
};
const useUser = () => {
  const queryClient = useQueryClient();

  const userQuery = useQuery('user', getUser, {
    useErrorBoundary: true,
  });

  const changeProfileMutation = useMutation(
    (user: UserProfile) => changeProfile(user),
    {
      onSuccess: (updatedUser) => {
        queryClient.setQueryData('user', updatedUser);
      },
    },
  );
  const changePasswordMutation = useMutation(
    (user: UserPassword) => changePassword(user),
    {
      onSuccess: (updatedUser) => {
        queryClient.setQueryData('user', updatedUser);
      },
    },
  );
  return {
    user: userQuery.data,
    changeProfile: changeProfileMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    error:
      userQuery.error ||
      changeProfileMutation.error ||
      changePasswordMutation.error,
    loading:
      userQuery.isLoading ||
      changeProfileMutation.isLoading ||
      changePasswordMutation.isLoading,
  };
};

export default useUser;
