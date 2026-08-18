import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';

export const useLoginMutation = () =>
  useMutation({ mutationFn: authService.login });

export const useRegisterMutation = () =>
  useMutation({ mutationFn: authService.register });

export const useVerifyMutation = () =>
  useMutation({ mutationFn: authService.verify });

export const useResendVerificationMutation = () =>
  useMutation({
    mutationFn: ({
      email,
      mode,
    }: Parameters<typeof authService.resendVerification> extends [
      infer Email,
      infer Mode,
    ]
      ? { email: Email; mode: Mode }
      : never) => authService.resendVerification(email, mode),
  });

export const useForgotPasswordMutation = () =>
  useMutation({ mutationFn: authService.requestPasswordReset });

export const useResetPasswordMutation = () =>
  useMutation({ mutationFn: authService.resetPassword });

export const useChangePasswordMutation = () =>
  useMutation({ mutationFn: authService.changePassword });

export const useRefreshSessionMutation = () =>
  useMutation({ mutationFn: authService.refresh });

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => queryClient.clear(),
  });
};
