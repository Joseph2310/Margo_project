import { z } from 'zod';
import { translate, type Translate } from '../localization';

const defaultTranslate: Translate = (key, params) =>
  translate('ar', key, params);

const required = (t: Translate, field: string) =>
  z.string().trim().min(1, t('validation.required', { field }));

export const createEmailSchema = (t: Translate) =>
  z
    .string()
    .trim()
    .min(1, t('validation.emailRequired'))
    .email(t('validation.emailInvalid'));

export const createPasswordSchema = (t: Translate) =>
  z
    .string()
    .min(8, t('validation.passwordMin'))
    .regex(/[0-9]/, t('validation.passwordNumber'))
    .regex(/[A-Z]/, t('validation.passwordUppercase'));

export const createLoginSchema = (t: Translate) =>
  z.object({
    email: createEmailSchema(t),
    password: z.string().min(1, t('validation.passwordRequired')),
  });

export const createRegistrationSchema = (t: Translate) =>
  z
    .object({
      name: required(t, t('fields.name')),
      birthDate: required(t, t('fields.birthDate')),
      stage: required(t, t('fields.stage')),
      address: required(t, t('fields.address')),
      phone: required(t, t('fields.phone')),
      whatsapp: required(t, t('fields.whatsapp')),
      school: required(t, t('fields.school')),
      classSaintName: required(t, t('fields.classSaintName')),
      confessionFather: z.string().optional(),
      talentsText: z.string().optional(),
      email: createEmailSchema(t),
      password: createPasswordSchema(t),
      confirmPassword: z
        .string()
        .min(1, t('validation.confirmPasswordRequired')),
    })
    .refine(values => values.password === values.confirmPassword, {
      path: ['confirmPassword'],
      message: t('validation.passwordsMismatch'),
    });

export const createResetPasswordSchema = (t: Translate) =>
  z
    .object({
      password: createPasswordSchema(t),
      confirmPassword: z
        .string()
        .min(1, t('validation.confirmPasswordRequired')),
    })
    .refine(values => values.password === values.confirmPassword, {
      path: ['confirmPassword'],
      message: t('validation.passwordsMismatch'),
    });

export const createChangePasswordSchema = (t: Translate) =>
  createResetPasswordSchema(t).and(
    z.object({
      currentPassword: z
        .string()
        .min(1, t('validation.currentPasswordRequired')),
    }),
  );

export const createVerificationSchema = (t: Translate) =>
  z.object({
    code: z.string().regex(/^\d{6}$/, t('validation.otpInvalid')),
  });

// Arabic defaults preserve the public schema exports used by non-React code
// and tests. Screens use the factories above so messages follow the language.
export const emailSchema = createEmailSchema(defaultTranslate);
export const passwordSchema = createPasswordSchema(defaultTranslate);
export const loginSchema = createLoginSchema(defaultTranslate);
export const registrationSchema = createRegistrationSchema(defaultTranslate);
export const resetPasswordSchema = createResetPasswordSchema(defaultTranslate);
export const changePasswordSchema =
  createChangePasswordSchema(defaultTranslate);
export const verificationSchema = createVerificationSchema(defaultTranslate);

export type LoginForm = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegistrationForm = z.infer<
  ReturnType<typeof createRegistrationSchema>
>;
export type ResetPasswordForm = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;
export type ChangePasswordForm = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;
export type VerificationForm = z.infer<
  ReturnType<typeof createVerificationSchema>
>;
