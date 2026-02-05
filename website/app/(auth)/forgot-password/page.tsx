"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import apiHelper from "@/helper/axios-helper";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      toast.dismiss();
      const resp = await apiHelper.post("/auth/forgot-password", {
        email,
      });

      if (resp?.data?.statusCode === 200) {
        toast.success(
          resp.data.message ||
            "If the email exists, a password reset link has been sent"
        );
        setIsSubmitted(true);
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(
        error?.response?.data?.message ||
          "Failed to send password reset instructions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 bg-white">
        {isSubmitted ? (
          <>
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-slate-600" />
              </div>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                Check your email
              </CardTitle>
              <CardDescription className="text-slate-600">
                We&apos;ve sent a password reset link to your email address.
                Please check your inbox.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-slate-900 hover:text-slate-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold text-slate-900">
                Forgot password?
              </CardTitle>
              <CardDescription className="text-slate-600">
                No worries, we&apos;ll send you reset instructions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-600"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {isLoading ? "Sending..." : "Reset Password"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
