import { createHash } from 'node:crypto';
import path from 'node:path';
import { UserRole } from '@/types/admin';
import { getCloudData, saveCloudData } from '@/lib/cloud-store';

export interface OtpTokenRecord {
  otpHash: string;
  expiresAt: number;
  attempts: number;
  sentAt: number;
}

export interface AdminCredentialRecord {
  passwordHash: string;
  updatedAt: string;
}

const OTP_STORE_KEY = 'admin_otp_tokens';
const OTP_LOCAL_FILE = path.join(process.cwd(), 'data', 'admin-otp-tokens.json');

const CRED_STORE_KEY = 'admin_credentials';
const CRED_LOCAL_FILE = path.join(process.cwd(), 'data', 'admin-credentials.json');

export async function loadAdminOtpTokens(): Promise<Record<string, OtpTokenRecord>> {
  return getCloudData<Record<string, OtpTokenRecord>>(OTP_STORE_KEY, OTP_LOCAL_FILE, () => ({}));
}

export async function saveAdminOtpTokens(tokens: Record<string, OtpTokenRecord>): Promise<void> {
  await saveCloudData(OTP_STORE_KEY, OTP_LOCAL_FILE, tokens);
}

export async function loadAdminCredentials(): Promise<Record<string, AdminCredentialRecord>> {
  return getCloudData<Record<string, AdminCredentialRecord>>(CRED_STORE_KEY, CRED_LOCAL_FILE, () => ({}));
}

export async function saveAdminCredentials(creds: Record<string, AdminCredentialRecord>): Promise<void> {
  await saveCloudData(CRED_STORE_KEY, CRED_LOCAL_FILE, creds);
}

export function hashAdminOtp(email: string, otp: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET || 'ahammed-fertilizer-otp-salt';
  return createHash('sha256').update(`${email}:${otp}:${secret}`).digest('hex');
}

export function getAllowedAdminAccounts(): { email: string; role: UserRole; name: string; userId: string }[] {
  const envEmails = (process.env.ADMIN_OTP_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const allowedEmails = envEmails.length > 0 ? envEmails : ['abmasud128@gmail.com'];

  return allowedEmails.map((email) => ({
    email,
    role: 'owner' as UserRole,
    name: 'Ahammed Masud (Owner)',
    userId: 'user-owner-1',
  }));
}
