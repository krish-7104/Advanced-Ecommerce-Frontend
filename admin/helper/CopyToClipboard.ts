import { toast } from "sonner";

export const CopyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to Clipboard!");
};
