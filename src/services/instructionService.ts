import { Instruction, InstructionsUpdate } from '../types/instruction';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

export const instructionService = {
  list: async (): Promise<Instruction[]> => {
    return await apiGet<Instruction[]>('/chatbot/admin/instructions');
  },
  getByKey: async (key: string): Promise<Instruction> => {
    return await apiGet<Instruction>(`/chatbot/admin/instructions/${encodeURIComponent(key)}`);
  },
  create: async (item: Instruction): Promise<Instruction> => {
    return await apiPost<Instruction>('/chatbot/admin/instructions', item);
  },
  upsertByKey: async (key: string, item: Instruction): Promise<Instruction> => {
    return await apiPut<Instruction>(`/chatbot/admin/instructions/${encodeURIComponent(key)}`, item);
  },
  bulkUpdate: async (payload: InstructionsUpdate): Promise<Instruction[]> => {
    return await apiPut<Instruction[]>('/chatbot/admin/instructions', payload);
  },
  delete: async (key: string): Promise<any> => {
    return await apiDelete(`/chatbot/admin/instructions/${encodeURIComponent(key)}`);
  },
};
