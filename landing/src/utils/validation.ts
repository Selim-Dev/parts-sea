export interface LoginValidationErrors {
  username?: string;
  password?: string;
}

export function validateLoginForm(
  username: string,
  password: string
): LoginValidationErrors {
  const errors: LoginValidationErrors = {};

  if (!username || username.trim().length === 0) {
    errors.username = 'يرجى إدخال اسم المستخدم';
  }

  if (!password || password.trim().length === 0) {
    errors.password = 'يرجى إدخال كلمة المرور';
  }

  return errors;
}
