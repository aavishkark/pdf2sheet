import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useUserProfile() {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const response = await api.get('/user/profile');
            return response.data.data;
        },
        staleTime: 30000,
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (settings) => {
            const response = await api.put('/user/settings', settings);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['userProfile']);
        },
    });
}
