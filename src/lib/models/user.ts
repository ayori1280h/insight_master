import { Document } from 'mongodb';

/**
 * ユーザーロール
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

/**
 * ユーザーステータス
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * ユーザーインターフェース
 */
export interface User extends Document {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  profileImageUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

/**
 * ユーザー作成用インターフェース（パスワードは平文）
 */
export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
  profilePicture?: string;
  bio?: string;
}

/**
 * ユーザー更新用インターフェース
 */
export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  profilePicture?: string;
  bio?: string;
  role?: UserRole;
  isActive?: boolean;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    emailNotifications?: boolean;
  };
}

/**
 * ログインリクエストインターフェース
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 登録リクエストインターフェース
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

/**
 * 認証済みユーザーインターフェース（パスワードなしのユーザー情報）
 */
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profileImageUrl?: string;
  bio?: string;
}

/**
 * トークン検証の結果インターフェース
 */
export interface TokenValidationResult {
  isValid: boolean;
  user?: AuthenticatedUser;
  error?: string;
} 