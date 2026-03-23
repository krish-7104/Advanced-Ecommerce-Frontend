"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Save, CheckSquare, Square } from "lucide-react";
import PageTitle from "@/components/shared/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import apiHelper from "@/lib/axios-helper";
import {
  AdminUser,
  CreateAdminUserPayload,
  Permission,
} from "@/types/admin-user";

const AdminUserFormPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Permissions state
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreateAdminUserPayload>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    isActive: true,
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const init = async () => {
      try {
        const { data: perms } = await apiHelper.get("/permissions");
        setAllPermissions(perms);

        if (!isNew && id) {
          const { data: user } = await apiHelper.get(`/admins/${id}`);
          const nameParts = user.name?.split(" ") || [];
          setFormData({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            email: user.email,
            phoneNumber: user.phoneNumber || "",
            isActive: user.isActive,
          });
          if (user.permissions) {
            setSelectedPermissions(user.permissions.map((p: any) => p.id));
          }
        }
      } catch (error: any) {
        toast.error("Failed to load data");
        router.push("/settings/admins");
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [id, isNew, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      return toast.error("Please fill in required fields");
    }

    if (isNew && !formData.password) {
      return toast.error("Password is required for new users");
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        permissions: selectedPermissions,
      };

      if (!payload.password) delete payload.password;
      delete payload.confirmPassword;

      if (isNew) {
        await apiHelper.post("/admins", payload);
        toast.success("Admin created successfully");
      } else {
        await apiHelper.patch(`/admins/${id}`, payload);
        toast.success("Admin updated successfully");
      }
      router.push("/settings/admins");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId],
    );
  };

  const toggleResource = (resource: string, resourcePerms: Permission[]) => {
    const allSelected = resourcePerms.every((p) =>
      selectedPermissions.includes(p.id),
    );
    if (allSelected) {
      // Deselect all
      setSelectedPermissions((prev) =>
        prev.filter((id) => !resourcePerms.find((p) => p.id === id)),
      );
    } else {
      // Select all
      const newIds = resourcePerms.map((p) => p.id);
      setSelectedPermissions((prev) => [...new Set([...prev, ...newIds])]);
    }
  };

  // Group permissions by resource
  const groupedPermissions = allPermissions.reduce(
    (acc, perm) => {
      if (!acc[perm.resource]) acc[perm.resource] = [];
      acc[perm.resource].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  if (fetching) return <div className="p-8">Loading...</div>;

  return (
    <section className="w-full min-h-screen bg-white">
      <div className="flex justify-between items-center mb-6">
        <PageTitle
          addBackButton
          title={isNew ? "Create Admin User" : "Edit Admin User"}
          icon={<UserPlus size={24} />}
        />
      </div>

      <div className="container mx-auto max-w-4xl pb-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name *</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={!isNew}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phoneNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium cursor-pointer"
              >
                Active Account
              </label>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedPermissions).map(([resource, perms]) => {
                const isAllSelected = perms.every((p) =>
                  selectedPermissions.includes(p.id),
                );
                return (
                  <div key={resource} className="bg-white p-4 rounded border">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b">
                      <h4 className="font-medium capitalize">{resource}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => toggleResource(resource, perms)}
                      >
                        {isAllSelected ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((perm) => (
                        <div
                          key={perm.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={perm.id}
                            checked={selectedPermissions.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <label
                            htmlFor={perm.id}
                            className="text-sm capitalize cursor-pointer"
                          >
                            {perm.action}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Password */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              {isNew
                ? "Set Password"
                : "Change Password (leave empty to keep current)"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isNew ? "Password *" : "New Password"}
                </label>
                <Input
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={isNew}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isNew ? "Confirm Password *" : "Confirm New Password"}
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required={!!formData.password}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Admin"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AdminUserFormPage;
