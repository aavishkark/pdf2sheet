import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useVendors() {
    return useQuery({
        queryKey: ['vendors'],
        queryFn: async () => {
            const response = await api.get('/vendors');
            return response.data.data;
        },
        staleTime: 30000,
    });
}

export function useAddVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (vendorData) => {
            const response = await api.post('/vendors', vendorData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['vendors']);
        },
    });
}

export function useUpdateVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await api.put(`/vendors/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['vendors']);
        },
    });
}

export function useDeleteVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/vendors/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['vendors']);
        },
    });
}
