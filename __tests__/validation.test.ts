import {
  loginSchema,
  passwordSchema,
  registrationSchema,
  verificationSchema,
} from '../src/utils/validation';

describe('confirmed beneficiary validation rules', () => {
  test('accepts the displayed password requirements', () => {
    expect(passwordSchema.safeParse('Password1').success).toBe(true);
  });

  test.each(['Short1', 'password1', 'Password'])(
    'rejects an incomplete password: %s',
    value => {
      expect(passwordSchema.safeParse(value).success).toBe(false);
    },
  );

  test('requires a six-digit verification code', () => {
    expect(verificationSchema.safeParse({ code: '336123' }).success).toBe(true);
    expect(verificationSchema.safeParse({ code: '33612' }).success).toBe(false);
    expect(verificationSchema.safeParse({ code: 'ABC123' }).success).toBe(
      false,
    );
  });

  test('requires valid login fields', () => {
    expect(
      loginSchema.safeParse({ email: 'joy@example.com', password: 'value' })
        .success,
    ).toBe(true);
    expect(
      loginSchema.safeParse({ email: 'not-email', password: '' }).success,
    ).toBe(false);
  });

  test('requires matching registration passwords', () => {
    const result = registrationSchema.safeParse({
      name: 'جوي بركات',
      birthDate: '15 أكتوبر 1998',
      stage: 'الثانوية',
      address: 'عنوان البيت',
      phone: '01111111111',
      whatsapp: '01111111111',
      school: 'المدرسة',
      classSaintName: 'القديس أثناسيوس الرسولي',
      confessionFather: '',
      talentsText: '',
      email: 'joy@example.com',
      password: 'Password1',
      confirmPassword: 'Different1',
    });
    expect(result.success).toBe(false);
  });
});
