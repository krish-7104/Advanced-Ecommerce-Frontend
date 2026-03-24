"use client";

import { useAllPermissions } from "@/hooks/usePermission";
import { ShieldOff } from "lucide-react";

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

const PermissionGuard = ({ permission, children }: PermissionGuardProps) => {
  const permissions = useAllPermissions();

  if (permissions.length === 0) {
    return <>{children}</>;
  }

  if (!permissions.includes(permission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <div className="bg-red-50 p-5 rounded-full">
          <ShieldOff className="text-red-400" size={48} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">
            Access Denied
          </h2>
          <p className="text-gray-500 max-w-sm">
            You don&apos;t have permission to view this page. Contact your
            administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
