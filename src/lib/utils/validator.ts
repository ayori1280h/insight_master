import { ApiError } from '../middleware/errorMiddleware';

/**
 * バリデーションエラーの型定義
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * バリデーション結果の型定義
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
}

/**
 * データバリデーションユーティリティクラス
 */
export class Validator {
  /**
   * 入力値が空でないかを検証
   * @param value 検証する値
   * @param fieldName フィールド名
   * @returns エラーがあればエラーオブジェクト、なければnull
   */
  static notEmpty(value: any, fieldName: string): ValidationError | null {
    if (value === null || value === undefined || value === '') {
      return {
        field: fieldName,
        message: `${fieldName}は必須です。`
      };
    }
    return null;
  }

  /**
   * 文字列の最小長を検証
   * @param value 検証する値
   * @param fieldName フィールド名
   * @param min 最小長
   * @returns エラーがあればエラーオブジェクト、なければnull
   */
  static minLength(value: string, fieldName: string, min: number): ValidationError | null {
    if (!value || value.length < min) {
      return {
        field: fieldName,
        message: `${fieldName}は${min}文字以上である必要があります。`
      };
    }
    return null;
  }

  /**
   * 文字列の最大長を検証
   * @param value 検証する値
   * @param fieldName フィールド名
   * @param max 最大長
   * @returns エラーがあればエラーオブジェクト、なければnull
   */
  static maxLength(value: string, fieldName: string, max: number): ValidationError | null {
    if (value && value.length > max) {
      return {
        field: fieldName,
        message: `${fieldName}は${max}文字以下である必要があります。`
      };
    }
    return null;
  }

  /**
   * メールアドレスの形式を検証
   * @param email 検証するメールアドレス
   * @returns エラーがあればエラーオブジェクト、なければnull
   */
  static isEmail(email: string): ValidationError | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        field: 'email',
        message: '有効なメールアドレスを入力してください。'
      };
    }
    return null;
  }

  /**
   * パスワードの強度を検証
   * @param password 検証するパスワード
   * @returns エラーがあればエラーオブジェクト、なければnull
   */
  static isStrongPassword(password: string): ValidationError | null {
    // 少なくとも1つの大文字、小文字、数字、特殊文字を含む8文字以上
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      return {
        field: 'password',
        message: 'パスワードは8文字以上で、大文字、小文字、数字、特殊文字をそれぞれ1つ以上含む必要があります。'
      };
    }
    return null;
  }

  /**
   * 複数のバリデーションを実行
   * @param validations バリデーション結果の配列
   * @returns バリデーション結果オブジェクト
   */
  static validate(validations: (ValidationError | null)[]): ValidationResult {
    const errors = validations.filter(error => error !== null) as ValidationError[];
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * バリデーション結果が無効な場合にエラーをスロー
   * @param result バリデーション結果
   * @throws バリデーションエラーがある場合はApiErrorをスロー
   */
  static throwIfInvalid(result: ValidationResult): void {
    if (!result.isValid && result.errors && result.errors.length > 0) {
      const messages = result.errors.map(error => `${error.field}: ${error.message}`).join(', ');
      throw new ApiError(messages, 400);
    }
  }
} 