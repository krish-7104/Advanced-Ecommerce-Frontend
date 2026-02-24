"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { CheckCircle, XCircle, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import apiHelper from "@/helper/axios-helper";
import { RootState } from "@/redux/store";

const VerifyEmailPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectFromQuery = searchParams.get("redirect") || "";

  const id = params.id as string;
  const email = useSelector((state: RootState) => state.user.user?.email);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      let loadingToastId: string | number | undefined;
      try {
        loadingToastId = toast.loading("Verifying your email...");
        const resp = await apiHelper.post(`/auth/verify-email`, {
          token: id,
        });

        if (resp?.data?.statusCode === 200) {
          toast.dismiss(loadingToastId);
          toast.success(resp.data.message || "Email verified successfully");
          setStatus("success");
          setTimeout(() => {
            if (redirectFromQuery) {
              router.push(redirectFromQuery);
            } else router.push("/");
          }, 2000);
        } else {
          throw new Error(resp?.data?.message || "Failed to verify email");
        }
      } catch (error: any) {
        if (loadingToastId) {
          toast.dismiss(loadingToastId);
        }
        const message =
          error?.response?.data?.message || "Failed to verify email";
        setErrorMessage(message);
        setStatus("error");
        toast.error(message);
      }
    };

    if (id) {
      verifyEmail();
    }
  }, [id, router]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Email not found. Please login again.");
      router.push("/login");
      return;
    }

    let loadingToastId: string | number | undefined;
    try {
      setIsResending(true);
      loadingToastId = toast.loading("Sending verification email...");
      const resp = await apiHelper.post("/auth/send-email-verification", {
        email,
      });

      if (resp?.data?.statusCode === 200) {
        toast.dismiss(loadingToastId);
        toast.success(
          resp.data.message || "Verification email sent successfully",
        );
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (error: any) {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.error(
        error?.response?.data?.message ||
          "Failed to send verification email. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-100 bg-white">
        <CardHeader className="text-center">
          {status === "loading" && (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          )}
          {status === "error" && (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          )}
          <CardTitle className="text-2xl font-semibold text-slate-900">
            {status === "loading" && "Verifying Email"}
            {status === "success" && "Email Verified"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {status === "loading" &&
              "Please wait while we verify your email address"}
            {status === "success" &&
              "Your email has been successfully verified"}
            {status === "error" &&
              "We couldn't verify your email. Please try again"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "loading" && (
            <div className="text-center text-sm text-slate-600">
              <p>Verifying your email address...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-sm font-medium text-green-900">
                  Your email has been verified successfully!
                </p>
                <p className="mt-2 text-sm text-green-700">
                  Redirecting to{" "}
                  {redirectFromQuery ? redirectFromQuery : "Home Page"}...
                </p>
              </div>
              <Link href="/">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Go to Home
                </Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm font-medium text-red-900">
                  Verification Failed
                </p>
                <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
              </div>

              {email && (
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <p className="text-sm font-medium text-blue-900">
                    Resend verification email to:
                  </p>
                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    {email}
                  </p>
                </div>
              )}

              {!email && (
                <div className="rounded-lg bg-yellow-50 p-4 text-center">
                  <p className="text-sm text-yellow-900">
                    Please login to resend verification email
                  </p>
                </div>
              )}

              <Button
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <div className="pt-4 border-t border-slate-200">
                <Link
                  href="/verify-email"
                  className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Go to Send Email Page
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
