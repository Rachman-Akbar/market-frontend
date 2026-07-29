import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCrudList({ queryKey, queryFn, enabled = true, staleTime }) {
  return useQuery({ queryKey, queryFn, enabled, staleTime });
}

export function useCrudMutations({ queryKey, createFn, updateFn, deleteFn }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({ mutationFn: createFn, onSuccess: invalidate });
  const updateMutation = useMutation({ mutationFn: updateFn, onSuccess: invalidate });
  const deleteMutation = useMutation({ mutationFn: deleteFn, onSuccess: invalidate });

  return { createMutation, updateMutation, deleteMutation };
}
