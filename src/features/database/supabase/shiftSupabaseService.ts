"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface EmailTrackingRecord {
  id: string;
  message_id: string;
  thread_id: string;
  is_shift_open: boolean;
  created_at: string;
}

export interface ShiftRecord {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  department: string;
  status: 'open' | 'pending_response' | 'assigned';
  worker_name: string | null;
  worker_email: string | null;
  gmail_thread_id: string | null;
  gmail_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateShiftData {
  date: string;
  startTime: string;
  endTime: string;
  department: string;
}

export interface UpdateShiftData {
  id: string;
  status?: 'open' | 'pending_response' | 'assigned';
  worker_name?: string | null;
  worker_email?: string | null;
  gmail_thread_id?: string | null;
  gmail_message_id?: string | null;
}

/**
 * Creates a new shift in the database
 *
 * @param shiftData - Data for the new shift
 * @returns Promise that resolves to the created shift record
 */
export async function createShift(shiftData: CreateShiftData): Promise<ShiftRecord> {
  const { data, error } = await supabase
    .from("shifts")
    .insert([
      {
        date: shiftData.date,
        start_time: shiftData.startTime,
        end_time: shiftData.endTime,
        department: shiftData.department,
        status: 'open',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Retrieves all shifts for a specific date
 *
 * @param date - Date string in YYYY-MM-DD format
 * @returns Promise that resolves to array of shift records
 */
export async function getShiftsByDate(date: string): Promise<ShiftRecord[]> {
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .eq("date", date)
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Retrieves all shifts
 *
 * @returns Promise that resolves to array of all shift records
 */
export async function getAllShifts(): Promise<ShiftRecord[]> {
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .order("date", { ascending: false })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Updates a shift in the database
 *
 * @param updateData - Data to update the shift with
 * @returns Promise that resolves to the updated shift record
 */
export async function updateShift(updateData: UpdateShiftData): Promise<ShiftRecord> {
  const { id, ...updateFields } = updateData;
  
  const { data, error } = await supabase
    .from("shifts")
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deletes a shift from the database
 *
 * @param id - ID of the shift to delete
 * @returns Promise that resolves to void
 */
export async function deleteShift(id: string): Promise<void> {
  const { error } = await supabase
    .from("shifts")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Assigns a worker to a shift
 *
 * @param shiftId - ID of the shift to assign
 * @param workerName - Name of the worker
 * @param workerEmail - Email of the worker
 * @returns Promise that resolves to the updated shift record
 */
export async function assignWorkerToShift(
  shiftId: string,
  workerName: string,
  workerEmail: string
): Promise<ShiftRecord> {
  const { data, error } = await supabase
    .from("shifts")
    .update({
      worker_name: workerName,
      worker_email: workerEmail,
      status: 'assigned',
    })
    .eq("id", shiftId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates shift status to pending response
 *
 * @param shiftId - ID of the shift to update
 * @param gmailThreadId - Gmail thread ID
 * @param gmailMessageId - Gmail message ID
 * @returns Promise that resolves to the updated shift record
 */
export async function setShiftPendingResponse(
  shiftId: string,
  gmailThreadId: string,
  gmailMessageId: string
): Promise<ShiftRecord> {
  const { data, error } = await supabase
    .from("shifts")
    .update({
      status: 'pending_response',
      gmail_thread_id: gmailThreadId,
      gmail_message_id: gmailMessageId,
    })
    .eq("id", shiftId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Saves email tracking information to track shift availability
 *
 * @param messageId - Gmail message ID from the sent email
 * @param threadId - Gmail thread ID from the sent email
 * @param isShiftOpen - Boolean indicating if the shift is still open
 * @returns Promise that resolves to the saved email tracking record
 */
export async function saveEmailTracking(
  messageId: string,
  threadId: string,
  isShiftOpen: boolean = true
): Promise<EmailTrackingRecord> {
  const { data, error } = await supabase
    .from("email_tracking")
    .insert([
      {
        message_id: messageId,
        thread_id: threadId,
        is_shift_open: isShiftOpen,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Checks if a shift is still open based on the message ID
 *
 * @param messageId - Gmail message ID to check
 * @returns Promise that resolves to boolean indicating if shift is open
 */
export async function isShiftOpen(messageId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("email_tracking")
    .select("is_shift_open")
    .eq("message_id", messageId)
    .single();

  if (error) throw error;
  return data.is_shift_open;
}

/**
 * Closes a shift (sets is_shift_open to false)
 *
 * @param messageId - Gmail message ID to identify the shift
 * @returns Promise that resolves to the updated record
 */
export async function closeShift(
  messageId: string
): Promise<EmailTrackingRecord> {
  const { data, error } = await supabase
    .from("email_tracking")
    .update({ is_shift_open: false })
    .eq("message_id", messageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
