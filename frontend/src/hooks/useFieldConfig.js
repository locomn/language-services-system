import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fieldConfigApi } from '../api/fieldConfig';

export const useFieldConfig = () => {
  const queryClient = useQueryClient();

  const { data: fields, isLoading, error } = useQuery(
    'fieldConfigs',
    fieldConfigApi.getAllFields
  );

  const updateFieldMutation = useMutation(
    ({ id, data }) => fieldConfigApi.updateField(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('fieldConfigs');
      },
    }
  );

  const createFieldMutation = useMutation(
    (data) => fieldConfigApi.createField(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('fieldConfigs');
      },
    }
  );

  const deleteFieldMutation = useMutation(
    (id) => fieldConfigApi.deleteField(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('fieldConfigs');
      },
    }
  );

  const { data: auditTrail, isLoading: isAuditLoading } = useQuery(
    'fieldConfigAudit',
    fieldConfigApi.getAuditTrail
  );

  return {
    fields,
    isLoading,
    error,
    updateField: updateFieldMutation.mutate,
    createField: createFieldMutation.mutate,
    deleteField: deleteFieldMutation.mutate,
    auditTrail,
    isAuditLoading,
  };
};
