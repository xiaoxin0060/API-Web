import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { BaseResponse } from '@/types/api'
import { ElMessage } from 'element-plus'

/**
 * API 查询 Composable
 * 基于 TanStack Query 的数据获取和缓存
 */
export function useApiQuery<TData = any>(
  queryKey: string[],
  queryFn: () => Promise<BaseResponse<TData>>,
  options?: {
    enabled?: boolean
    staleTime?: number
    gcTime?: number
    retry?: number
    retryDelay?: number
  }
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await queryFn()
      if (response.code !== 0) {
        throw new Error(response.message || '请求失败')
      }
      return response.data
    },
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5分钟
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10分钟
    retry: options?.retry ?? 2,
    retryDelay: options?.retryDelay ?? 1000,
    enabled: options?.enabled ?? true,
  })
}

/**
 * API 变更 Composable
 * 用于增删改操作
 */
export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<BaseResponse<TData>>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
    invalidateQueries?: string[][]
    showSuccessMessage?: boolean | string
    showErrorMessage?: boolean
  }
) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await mutationFn(variables)
      if (response.code !== 0) {
        throw new Error(response.message || '操作失败')
      }
      return response.data
    },
    onSuccess: (data, variables) => {
      // 显示成功消息
      if (options?.showSuccessMessage !== false) {
        const message = typeof options?.showSuccessMessage === 'string' 
          ? options.showSuccessMessage 
          : '操作成功'
        ElMessage.success(message)
      }
      
      // 失效相关查询缓存
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey })
        })
      }
      
      // 执行自定义成功回调
      options?.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      // 显示错误消息
      if (options?.showErrorMessage !== false) {
        ElMessage.error(error.message || '操作失败')
      }
      
      // 执行自定义错误回调
      options?.onError?.(error, variables)
    }
  })
}

/**
 * 分页查询 Composable
 */
export function usePaginatedQuery<TData = any>(
  baseQueryKey: string,
  queryFn: (params: any) => Promise<BaseResponse<{ records: TData[], total: number }>>,
  initialParams: Record<string, any> = {}
) {
  const params = ref({
    current: 1,
    pageSize: 10,
    ...initialParams
  })
  
  const queryKey = computed(() => [baseQueryKey, { ...params.value }])
  
  const query = useApiQuery(
    queryKey.value as unknown as string[],
    () => queryFn({ ...params.value }),
    {
      staleTime: 2 * 60 * 1000, // 分页数据2分钟失效
    }
  )
  
  const updateParams = (newParams: Partial<typeof params.value>) => {
    params.value = { ...params.value, ...newParams }
  }
  
  const resetParams = () => {
    params.value = { current: 1, pageSize: 10, ...initialParams }
  }
  
  const goToPage = (page: number) => {
    updateParams({ current: page })
  }
  
  const changePageSize = (size: number) => {
    updateParams({ current: 1, pageSize: size })
  }
  
  return {
    // 查询结果
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isFetching: query.isFetching,
    
    // 分页参数
    params: computed(() => params.value),
    
    // 分页信息
    records: computed(() => query.data.value?.records ?? []),
    total: computed(() => query.data.value?.total ?? 0),
    current: computed(() => params.value.current),
    pageSize: computed(() => params.value.pageSize),
    
    // 分页操作
    updateParams,
    resetParams,
    goToPage,
    changePageSize,
    
    // 刷新
    refetch: query.refetch,
  }
}
