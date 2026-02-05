"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
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
import { setUser } from "@/redux/slices/user.slice";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoading(true);
      toast.dismiss();
      const resp = await apiHelper.post("/auth/register", {
        email,
        password,
        firstName,
        lastName,
      });

      if (resp?.data?.statusCode === 201) {
        dispatch(setUser(resp.data.data));
        toast.success(resp.data.message || "Account created successfully");
        router.push("/");
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900">
            Create an account
          </CardTitle>
          <CardDescription className="text-slate-600">
            Join us for a premium shopping experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-700">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-700">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-600"
                />
              </div>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            By creating an account, you agree to our{" "}
            <Link
              href="/terms"
              className="text-slate-900 hover:text-slate-700"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-slate-900 hover:text-slate-700"
            >
              Privacy Policy
            </Link>
          </p>

          <div className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-slate-900 hover:text-slate-700 font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
