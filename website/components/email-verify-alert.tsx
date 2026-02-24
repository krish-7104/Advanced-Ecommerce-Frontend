"use client";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { useRouter, usePathname } from "next/navigation";

const EmailVerifyAlert = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const pathname = usePathname();

  const isOnAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-email";

  if (isOnAuthPage) return null;
  if (user?.emailVerified) return null;
  return (
    <section className="bg-blue-100 p-2 sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        You need to verify your email to make purchases.
        <Button
          className="rounded-full border-0 cursor-pointer"
          variant={"link"}
          onClick={() => router.push(`/verify-email?email=${user?.email}`)}
        >
          Click here to verify your email{" "}
        </Button>
      </div>
    </section>
  );
};

export default EmailVerifyAlert;
