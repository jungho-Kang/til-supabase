import SideNavigation from "@/components/common/navigation/SideNavigation";
import { ReactNode } from "react";
// Supabase Server Client
import { createServerSideClient } from "@/lib/supabase/server";
// SEO
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Blog Supabase",
  openGraph: {
    title: "Blog",
    description: "Blog Supabase",
    images: [{ url: "/thumbnail.png" }],
  },
};

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <SideNavigation user={user} />
      <div>{children}</div>
    </>
  );
}
