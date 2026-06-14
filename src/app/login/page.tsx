"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import PageImage from "@/assets/img/open-quran.jpg";
import MQILogo from "@/assets/img/mqi-logo.png";

import { useLoginMutation } from "@/services/authApi";
import { useAppDispatch } from "@/hooks";
import { setAuth } from "@/store/authSlice";
import { decodeJwt } from "@/lib/jwt";
import { toastMessage } from "@/lib/toaster";

const loginSchema = z.object({
    phoneNumber: z.string().regex(/^\d{9}$/, {
        message: "Please enter a valid 9-digit phone number.",
    }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
    rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [login, { isLoading }] = useLoginMutation();
    const dispatch = useAppDispatch();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            phoneNumber: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (formData: LoginFormData) => {
        try {
            const fullNumber = `+233${formData.phoneNumber}`;
            const response = await login({
                phoneNumber: fullNumber,
                password: formData.password,
            }).unwrap();

            // Backend returns { message, token, organisationName }. Identity
            // (id/phone) is decoded from the JWT; there's no refresh token.
            const claims = decodeJwt(response.token);

            dispatch(
                setAuth({
                    isAuthenticated: true,
                    token: response.token,
                    refreshToken: null,
                    user: {
                        id: claims?.id ?? "",
                        phoneNumber: claims?.phone ?? fullNumber,
                        organisationName: response.organisationName,
                    },
                }),
            );

            toastMessage({
                header: "Success",
                message: "Login successful!",
                toastType: "success",
            });
            router.push("/contests");
        } catch {
            toastMessage({
                header: "Login failed",
                message: "Please check your phone number and password.",
                toastType: "error",
            });
        }
    };

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative hidden md:block md:w-1/2 bg-emerald-900">
                <div className="absolute inset-0 bg-emerald-950/30 z-10" />
                <Image
                    src={PageImage}
                    alt="Open Quran"
                    fill
                    className="object-cover opacity-15"
                    priority
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-12 text-white">
                    <Image
                        src={MQILogo}
                        alt="MQI Logo"
                        className="size-52"
                        priority
                    />
                    <div className="max-w-md text-center">
                        <h1 className="text-4xl font-bold mb-6">
                            MQI Quran Quiz App
                        </h1>
                        <p className="text-lg mb-8">
                            Digitize your Qur&apos;an contests — no paper, no
                            stress. Randomize questions, sync displays, and run
                            seamless events with ease.
                        </p>
                    </div>
                </div>
            </div>

            {/* Login Form Section */}
            <div className="flex flex-1 items-center justify-center p-6 md:p-12 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:hidden mb-6">
                            Quran Quiz Competition
                        </h2>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            Welcome Back
                        </h2>
                        <p className="mt-4 text-sm text-gray-600">
                            Please sign in to your account to create and
                            organise contests.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-8 space-y-6"
                    >
                        {/* Phone number */}
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone number</Label>
                            <div className="flex items-center rounded-md border border-gray-300 px-3 bg-white focus-within:border-emerald-500">
                                <span className="text-sm text-gray-500 flex items-center gap-1 pr-2 border-r border-gray-300">
                                    <span>🇬🇭</span>
                                    <span className="font-medium">+233</span>
                                </span>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="XXXXXXXXX"
                                    className="border-0 focus-visible:ring-0 px-2"
                                    {...register("phoneNumber")}
                                    onChange={(e) => {
                                        const digits = e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 9);
                                        setValue("phoneNumber", digits, {
                                            shouldValidate: true,
                                        });
                                    }}
                                />
                            </div>
                            {errors.phoneNumber && (
                                <p className="text-sm text-red-600">
                                    {errors.phoneNumber.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="#"
                                    className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pr-10 border-gray-300 focus-visible:border-emerald-500"
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                onCheckedChange={(checked) =>
                                    setValue("rememberMe", checked === true)
                                }
                            />
                            <Label
                                htmlFor="remember"
                                className="text-sm font-medium"
                            >
                                Remember me
                            </Label>
                        </div>

                        <Button
                            size="lg"
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isLoading ? "Signing in…" : "Sign In"}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-gray-500">
                                Don&apos;t have an account?
                            </span>{" "}
                            <Link
                                href="#"
                                className="font-medium text-emerald-600 hover:text-emerald-500"
                            >
                                Sign up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
