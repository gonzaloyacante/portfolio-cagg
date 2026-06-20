import axiosInstance from '@/lib/axios';

export type MessagePayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  /**
   * Honeypot field. Real users never see or fill this; bots auto-fill any
   * input they find. The server returns 200/success without persisting.
   */
  website?: string;
};

export const messagesService = {
  submit: (payload: MessagePayload) =>
    axiosInstance.post<{ ok: boolean }>('/api/messages', payload),
};
