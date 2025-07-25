"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogOut, FileSearch } from "lucide-react";
import { Button } from "@/shared";
import { signOut } from "next-auth/react";

function SignOutDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Sign Out</h2>
        <p className="mb-6">Are you sure you want to sign out?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSignOut = () => setDialogOpen(true);
  const handleCancel = () => setDialogOpen(false);
  const handleConfirm = async () => {
    setDialogOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left Side */}
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileSearch className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                CV Matcher
              </span>
            </Link>
            {/* Sign Out Button - Right Side */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>
      <SignOutDialog
        open={dialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      {/* Main Content */}
      <main>{children}</main>
    </>
  );
}
