// Barrel export for lib utilities
// This allows imports like: import { maskCNPJ, validateCNPJ, cn } from "@/lib"

// Utility functions
export { cn } from "./utils";

// Masks and validations
export {
  maskCNPJ,
  maskCEP,
  maskPhone,
  unmask,
  validateCNPJ,
  UFS,
} from "./masks";

// Validation schemas
export * from "./validations";

// External APIs
export { buscarCEP } from "./viaCep";

// Supabase clients
export { getSupabase } from "./supabaseClient";
export { createSupabaseAdmin } from "./supabaseAdmin";

// Auth utilities
export * from "./auth";

// NFe Parser
export * from "./nfeParser";

