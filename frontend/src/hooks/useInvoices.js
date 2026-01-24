import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function useInvoices() {
    return useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const response = await api.get('/invoices');
            return response.data.data;
        },
        staleTime: 30000,
    });
}
