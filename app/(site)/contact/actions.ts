"use server";
import { z } from "zod";
import { isDemoMode } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Please write a message.").max(5000),
});

export interface EnquiryState {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"name" | "email" | "message", string>>;
}

export async function sendEnquiry(_prev: EnquiryState, form: FormData): Promise<EnquiryState> {
  if (isDemoMode) {
    return { ok: false, message: "Demo mode: messages are not saved. Connect Supabase to receive enquiries." };
  }
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: { name: f.name?.[0], email: f.email?.[0], message: f.message?.[0] },
    };
  }
  const { name, email, phone, subject, message } = parsed.data;
  const db = await createClient();
  const { error } = await db.from("enquiries").insert({
    name, email, phone: phone || null, subject: subject || null, message,
  });
  if (error) return { ok: false, message: "Sorry, your message could not be sent. Please try again or use WhatsApp." };
  return { ok: true, message: "Thank you. Your message has been sent." };
}
