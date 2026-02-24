"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
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

export default function SendVerificationEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";
  const emailFromState = useSelector(
    (state: RootState) => state.user.user?.email,
  );
  const email = emailFromQuery || emailFromState || "";
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  const handleSendEmail = async () => {
    if (!email) {
      toast.error("Email not found. Please register or login first.");
      return;
    }

    let loadingToastId: string | number | undefined;
    try {
      setIsSending(true);
      loadingToastId = toast.loading("Sending verification email...");
      const resp = await apiHelper.post("/auth/send-email-verification", {
        email,
      });

      if (resp?.data?.statusCode === 200) {
        toast.dismiss(loadingToastId);
        toast.success(
          resp.data.message || "Verification email sent successfully",
        );
        setIsSent(true);
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
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-100 bg-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-semibold text-slate-900">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-slate-600">
            Send a verification email to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isSent && email && (
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-sm font-medium text-blue-900">
                Email has been sent to:
              </p>
              <p className="mt-1 text-sm font-semibold text-blue-700">
                {email}
              </p>
            </div>
          )}

          <div className="space-y-3 text-sm text-slate-600">
            <p>Please check your inbox and click on the verification link.</p>
            <p>
              If you don't see the email, check your spam folder or click the
              button below to resend.
            </p>
          </div>

          {isSent && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800 justify-center">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>Verification email sent successfully!</span>
            </div>
          )}

          <Button
            onClick={handleSendEmail}
            disabled={isSending || !email}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSending
              ? "Sending..."
              : isSent
                ? "Resend Verification Email"
                : "Send Verification Email"}
          </Button>

          <div className="pt-4 border-t border-slate-200">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
