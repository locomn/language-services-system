import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    getServiceLocations,
    getServiceLocation,
    createServiceLocation,
    updateServiceLocation,
    deleteServiceLocation
} from '../api/serviceLocations';

export const useServiceLocations = (filters = {}) => {
    return useQuery(['serviceLocations', filters], () => getServiceLocations(filters));
};

export const useServiceLocation = (id) => {
    return useQuery(['serviceLocation', id], () => getServiceLocation(id), {
        enabled: !!id
    });
};

export const useCreateServiceLocation = () => {
    const queryClient = useQueryClient();
    
    return useMutation(createServiceLocation, {
        onSuccess: () => {
            queryClient.invalidateQueries('serviceLocations');
        }
    });
};

export const useUpdateServiceLocation = () => {
    const queryClient = useQueryClient();
    
    return useMutation(
        ({ id, data }) => updateServiceLocation(id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('serviceLocations');
            }
        }
    );
};

export const useDeleteServiceLocation = () => {
    const queryClient = useQueryClient();
    
    return useMutation(deleteServiceLocation, {
        onSuccess: () => {
            queryClient.invalidateQueries('serviceLocations');
        }
    });
};
