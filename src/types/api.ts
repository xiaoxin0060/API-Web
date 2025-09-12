/**
 * 小新接口开发平台 API 类型定义
 * 基于后端接口文档自动生成并手动维护
 */

// 基础响应结构
export interface BaseResponse<T = any> {
  code: number
  data: T
  message: string
}

// 分页请求参数
export interface PaginationRequest {
  current?: number
  pageSize?: number
  sortField?: string
  sortOrder?: 'ascend' | 'descend'
}

// 分页响应数据
export interface PageData<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
  orders?: OrderItem[]
  optimizeCountSql?: boolean
  searchCount?: boolean
  optimizeJoinOfCountSql?: boolean
  maxLimit?: number
  countId?: string
}

export interface OrderItem {
  column: string
  asc: boolean
}

// 用户相关类型
export interface User {
  id: number
  userName: string
  userAccount: string
  userAvatar: string
  gender: number
  userRole: 'user' | 'admin'
  userPassword?: string  // 敏感信息
  accessKey?: string     // 敏感信息
  secretKey?: string     // 敏感信息
  createTime: string
  updateTime: string
  isDelete: number
}

export interface UserVO {
  id: number
  userName: string
  userAccount: string
  userAvatar: string
  gender: number
  userRole: 'user' | 'admin'
  createTime: string
  updateTime: string
}

// 用户操作请求类型
export interface UserLoginRequest {
  userAccount: string
  userPassword: string
}

export interface UserRegisterRequest {
  userAccount: string
  userPassword: string
  checkPassword: string
}

export interface UserUpdateRequest {
  id?: number
  userName?: string
  userAccount?: string
  userAvatar?: string
  gender?: number
  userRole?: string
  userPassword?: string
}

// 接口信息类型
export interface InterfaceInfo {
  id: number
  name: string
  description: string
  url: string
  providerUrl: string
  requestParams: string
  requestHeader: string
  responseHeader: string
  status: 0 | 1  // 0-下线 1-上线
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  userId: number
  createTime: string
  updateTime: string
  authType: string
  authConfig: string
  timeout: number
  retryCount: number
  providerUserId: number
  category: string
  tags: string
  version: string
  requestSchema: string
  responseSchema: string
  rateLimit: number
  price: number
  approvalStatus: string
  documentation: string
  exampleRequest: string
  exampleResponse: string
  isDelete: number
}

// 接口操作请求类型
export interface InterfaceInfoAddRequest {
  name: string
  description: string
  url: string
  providerUrl?: string
  requestParams?: string
  requestHeader?: string
  responseHeader?: string
  method: string
  category?: string
  tags?: string
  version?: string
  requestSchema?: string
  responseSchema?: string
  authType?: string
  authConfig?: string
  timeout?: number
  retryCount?: number
  rateLimit?: number
  price?: number
  documentation?: string
  exampleRequest?: string
  exampleResponse?: string
}

export interface InterfaceInfoUpdateRequest extends InterfaceInfoAddRequest {
  id: number
  status?: number
  approvalStatus?: string
  providerUserId?: number
}

export interface InterfaceInfoInvokeRequest {
  id: number
  userRequestParams: Record<string, any>
}

// 用户接口关系类型
export interface UserInterfaceInfo {
  id: number
  userId: number
  interfaceInfoId: number
  totalNum: number
  leftNum: number
  status: 0 | 1
  createTime: string
  updateTime: string
  isDelete: number
}

export interface UserInterfaceInfoAddRequest {
  userId: number
  interfaceInfoId: number
  totalNum: number
  leftNum: number
}

export interface UserInterfaceInfoUpdateRequest {
  id: number
  totalNum?: number
  leftNum?: number
  status?: number
}

export interface UserInterfaceInfoAddQuotaRequest {
  userId: number
  interfaceInfoId: number
  addCount: number
}

// 帖子类型
export interface Post {
  id: number
  age: number
  gender: number
  education: string
  place: string
  job: string
  contact: string
  loveExp: string
  content: string
  photo: string
  reviewStatus: number
  reviewMessage: string
  viewNum: number
  thumbNum: number
  userId: number
  createTime: string
  updateTime: string
  isDelete: number
}

export interface PostAddRequest {
  age: number
  gender: number
  education: string
  place: string
  job: string
  contact: string
  loveExp: string
  content: string
  photo?: string
}

export interface PostUpdateRequest extends PostAddRequest {
  id: number
  reviewStatus?: number
  reviewMessage?: string
}

// 通用请求类型
export interface DeleteRequest {
  id: number
}

export interface IdRequest {
  id: number
}
