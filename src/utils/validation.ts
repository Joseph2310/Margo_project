import { z } from 'zod';

const required = (label: string) => z.string().trim().min(1, `${label} مطلوب`);

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'البريد الالكتروني مطلوب')
  .email('أدخل بريداً إلكترونياً صحيحاً');

export const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب أن تتكون من 8 حروف على الأقل')
  .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم')
  .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export const registrationSchema = z
  .object({
    name: required('الاسم'),
    birthDate: required('تاريخ الميلاد'),
    stage: required('المرحلة'),
    address: required('عنوان البيت'),
    phone: required('رقم التليفون'),
    whatsapp: required('رقم الواتس اب'),
    school: required('المدرسة'),
    classSaintName: required('اسم قديس الفصل'),
    confessionFather: z.string().optional(),
    talentsText: z.string().optional(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine(values => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'كلمتا المرور غير متطابقتين',
  });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine(values => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'كلمتا المرور غير متطابقتين',
  });

export const changePasswordSchema = resetPasswordSchema.and(
  z.object({
    currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  }),
);

export const verificationSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'أدخل الكود المكون من 6 أرقام'),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegistrationForm = z.infer<typeof registrationSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
export type VerificationForm = z.infer<typeof verificationSchema>;
