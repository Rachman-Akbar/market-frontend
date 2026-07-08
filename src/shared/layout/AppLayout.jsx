import { Providers } from "@/shared/providers/Providers";

export default function AppLayout({ children }) {
  return <Providers>{children}</Providers>;
}