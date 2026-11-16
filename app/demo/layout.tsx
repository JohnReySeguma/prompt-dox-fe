import { DemoShell } from "@/components/demo/DemoShell";

export default function DemoLayout({ children }: LayoutProps<"/demo">) {
  return <DemoShell>{children}</DemoShell>;
}
