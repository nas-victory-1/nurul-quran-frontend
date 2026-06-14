"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, List, LogOut, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { resetAuth } from "@/store/authSlice";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  // Show the organisation name; if it's null, fall back to the phone number.
  const displayName = user?.organisationName || user?.phoneNumber || "";

  const navItems = [
    { href: "/contests", label: "Contests", icon: List },
    { href: "/create-contest", label: "Create Contest", icon: Plus },
  ];

  const handleLogout = () => {
    dispatch(resetAuth());
    router.push("/login");
  };

  return (
    <nav className="bg-white py-4 shadow-lg border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Organization Logo/Name */}
          <Link href="/contests" className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {displayName}
              </h1>
              <p className="text-xs text-gray-500">
                Competition Management System
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      isActive
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2 border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
