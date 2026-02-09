"use server"

import { submitFormData } from "cmx-sdk"

interface ContactFormState {
  success: boolean
  error?: string
  id?: string
}

export async function submitContactForm(
  _prevState: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot check
  const hp = formData.get("_hp") as string
  if (hp) {
    // Pretend success for bots
    return { success: true, id: "fake" }
  }

  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    company: (formData.get("company") as string) || "",
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  }

  try {
    const result = await submitFormData("contact", data)
    return { success: true, id: result.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "送信に失敗しました",
    }
  }
}
