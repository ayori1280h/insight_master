import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { NextResponse } from 'next/server';
import { TestSetup } from './testSetup';
import { UserRole } from '../models/user';
import { GET as getHealth } from '../../app/api/health/route';
import { POST as login } from '../../app/api/auth/login/route';
import { POST as register } from '../../app/api/auth/register/route';

describe('API Tests', () => {
  beforeAll(async () => {
    // テスト前の準備
    console.log('テストを開始します...');
  });

  afterAll(async () => {
    // テスト後のクリーンアップ
    await TestSetup.cleanup();
    console.log('テストが完了しました。');
  });

  describe('Health API', () => {
    it('ヘルスチェックエンドポイントが正常に応答する', async () => {
      // ヘルスチェックAPIを呼び出す
      const response = await getHealth();
      const data = await response.json();
      
      // レスポンスの検証
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status');
      expect(data.services).toHaveProperty('database');
      expect(data.services).toHaveProperty('api');
    });
  });

  describe('Authentication API', () => {
    it('ユーザー登録が成功する', async () => {
      // テスト用のユーザーデータ
      const userData = {
        name: 'テストユーザー',
        email: `test.${Date.now()}@example.com`,
        password: 'Test@12345',
        confirmPassword: 'Test@12345'
      };
      
      // リクエストの作成
      const reqInit: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      };
      
      // 登録APIを呼び出す
      const request = new Request('http://localhost:3000/api/auth/register', reqInit);
      const response = await register(request);
      const data = await response.json();
      
      // レスポンスの検証
      expect(response.status).toBe(201);
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe(userData.email);
    });

    it('ログインが成功する', async () => {
      // テストユーザーの作成
      const user = await TestSetup.createTestUser();
      
      // ログインデータ
      const loginData = {
        email: user.email,
        password: 'Test@12345'
      };
      
      // リクエストの作成
      const reqInit: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      };
      
      // ログインAPIを呼び出す
      const request = new Request('http://localhost:3000/api/auth/login', reqInit);
      const response = await login(request);
      const data = await response.json();
      
      // レスポンスの検証
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe(user.email);
    });
  });

  describe('User API', () => {
    it('認証済みユーザーがプロフィールを取得できる', async () => {
      // TODO: プロフィール取得APIのテスト実装
    });

    it('認証済みユーザーがプロフィールを更新できる', async () => {
      // TODO: プロフィール更新APIのテスト実装
    });
  });

  describe('Article API', () => {
    it('認証済みユーザーが記事を作成できる', async () => {
      // TODO: 記事作成APIのテスト実装
    });

    it('認証済みユーザーが記事一覧を取得できる', async () => {
      // TODO: 記事一覧取得APIのテスト実装
    });
    
    it('認証済みユーザーが記事を更新できる', async () => {
      // TODO: 記事更新APIのテスト実装
    });
    
    it('認証済みユーザーが記事を削除できる', async () => {
      // TODO: 記事削除APIのテスト実装
    });
  });

  describe('Insight API', () => {
    it('認証済みユーザーが記事にインサイトを追加できる', async () => {
      // TODO: インサイト追加APIのテスト実装
    });
    
    it('認証済みユーザーがインサイト一覧を取得できる', async () => {
      // TODO: インサイト一覧取得APIのテスト実装
    });
    
    it('認証済みユーザーがインサイトを更新できる', async () => {
      // TODO: インサイト更新APIのテスト実装
    });
    
    it('認証済みユーザーがインサイトを削除できる', async () => {
      // TODO: インサイト削除APIのテスト実装
    });
  });
}); 