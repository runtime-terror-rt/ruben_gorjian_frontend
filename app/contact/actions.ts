"use server";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const businessName = (formData.get("businessName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const websiteOrHandle = (formData.get("websiteOrHandle") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  // Server-side validation
  if (!fullName || !businessName || !email) {
    return {
      status: "error",
      message: "Full name, business name, and email are required.",
    };
  }

  const backendBase = "https://api.talexia.us";

  const payload = {
    fullName,
    businessName,
    email,
    websiteOrHandle: websiteOrHandle || "",
    interests: ["full-management"],
    postsPerMonth: "100",
    message: message || "",
    source: "google-search",
  };

  console.log({ payload });

  try {
    const response = await fetch(
      `${backendBase.replace(/\/$/, "")}/api/contacts`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      // Try JSON first, fall back to raw text so we always surface the real error
      const rawText = await response.text().catch(() => "");
      let errMessage = "Unable to submit contact form. Please try again.";
      try {
        const errorBody = JSON.parse(rawText);
        errMessage = errorBody?.error || errorBody?.message || errMessage;
      } catch {
        if (rawText) errMessage = rawText;
      }
      console.error(
        `[contact action] backend error ${response.status}:`,
        errMessage,
      );
      return { status: "error", message: errMessage };
    }

    return {
      status: "success",
      message:
        "Thank you for your message! We've received your request and will get back to you soon.",
    };
  } catch (err) {
    console.error("[contact action] fetch failed:", err);
    return {
      status: "error",
      message: "Unable to send message right now. Please try again later.",
    };
  }
}
