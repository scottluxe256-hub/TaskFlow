import { supabase } from '../lib/supabase';

// Meminta pengiriman OTP ke Email
export const requestPasswordOtp = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

// Verifikasi OTP yang diketikkan pengguna
export const verifyPasswordOtp = async (email: string, otp: string) => {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'recovery',
  });
  if (error) throw error;
};

// Mengubah kata sandi setelah OTP berhasil diverifikasi
export const setNewPassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
};
