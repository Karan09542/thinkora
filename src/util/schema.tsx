import { z } from "zod";
export const UserFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username must be at least 2 character long"),
  email: z.email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 character long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
});

export const UserSchema =  UserFormSchema.omit({ password: true }).safeExtend({
  token: z.string(),
  _id: z.string(),
});

export const ImageGenerateSchema = z.object({
  text: z.string().trim().min(1, ""),
  ratio: z.string(),
});
