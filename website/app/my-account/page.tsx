"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setUser, logout } from "@/redux/slices/user.slice";
import apiHelper from "@/helper/axios-helper";
import toast from "react-hot-toast";
import {
  User,
  MapPin,
  LogOut,
  Trash2,
  Plus,
  Edit,
  X,
  Check,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Address } from "@/types/address.types";

interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export default function MyAccountPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user,
  );

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [personalDetails, setPersonalDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [addressForm, setAddressForm] = useState({
    name: "",
    phoneNumber: user?.phoneNumber || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    loadData();
  }, [isAuthenticated, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userResp, addressesResp, sessionsResp] = await Promise.all([
        apiHelper.get("/auth/about/me?cartCount=true"),
        apiHelper.get("/address"),
        apiHelper.get("/auth/sessions"),
      ]);

      if (userResp?.data?.statusCode === 200) {
        const userData = userResp.data.data;
        dispatch(setUser(userData));
        setPersonalDetails({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
        });
      }

      if (addressesResp?.data?.statusCode === 200) {
        setAddresses(addressesResp.data.data);
      }

      if (sessionsResp?.data?.statusCode === 200) {
        setSessions(sessionsResp.data.data);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load account data",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePersonalDetails = async () => {
    try {
      const resp = await apiHelper.patch("/auth/update/me", personalDetails);
      if (resp?.data?.statusCode === 200) {
        dispatch(setUser(resp.data.data));
        toast.success("Personal details updated successfully");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update personal details",
      );
    }
  };

  const handleSaveAddress = async () => {
    try {
      if (editingAddress) {
        const resp = await apiHelper.patch(
          `/address/${editingAddress.id}`,
          addressForm,
        );
        if (resp?.data?.statusCode === 200) {
          toast.success("Address updated successfully");
          setAddressDialogOpen(false);
          setEditingAddress(null);
          resetAddressForm();
          loadData();
        }
      } else {
        const resp = await apiHelper.post("/address", addressForm);
        if (resp?.data?.statusCode === 201) {
          toast.success("Address added successfully");
          setAddressDialogOpen(false);
          resetAddressForm();
          loadData();
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const resp = await apiHelper.delete(`/address/${addressId}`);
      if (resp?.data?.statusCode === 200) {
        toast.success("Address deleted successfully");
        loadData();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const resp = await apiHelper.patch(`/address/${addressId}/set-default`);
      if (resp?.data?.statusCode === 200) {
        toast.success("Default address updated");
        loadData();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to set default address",
      );
    }
  };

  const handleLogoutSession = async (sessionId: string) => {
    try {
      const resp = await apiHelper.post(`/auth/sessions/${sessionId}/logout`);
      if (resp?.data?.statusCode === 200) {
        toast.success("Session logged out successfully");
        loadData();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to logout session");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    try {
      const resp = await apiHelper.delete("/auth/account");
      if (resp?.data?.statusCode === 200) {
        toast.success("Account deleted successfully");
        dispatch(logout());
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete account");
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      name: "",
      phoneNumber: user?.phoneNumber || "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const openAddressDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        name: address.name,
        phoneNumber: address.phoneNumber || "",
        line1: address.line1,
        line2: address.line2 || "",
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      resetAddressForm();
    }
    setAddressDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Account</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-slate-600" />
                <CardTitle>Personal Details</CardTitle>
              </div>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={personalDetails.firstName}
                    onChange={(e) =>
                      setPersonalDetails({
                        ...personalDetails,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={personalDetails.lastName}
                    onChange={(e) =>
                      setPersonalDetails({
                        ...personalDetails,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalDetails.email}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={personalDetails.phoneNumber}
                    onChange={(e) =>
                      setPersonalDetails({
                        ...personalDetails,
                        phoneNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleUpdatePersonalDetails}
                className="mt-6 bg-slate-900 hover:bg-slate-800"
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-slate-600" />
                  <CardTitle>Addresses</CardTitle>
                </div>
                <Button
                  onClick={() => openAddressDialog()}
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>
              <CardDescription>Manage your delivery addresses</CardDescription>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No addresses added yet
                </p>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border border-slate-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">
                              {address.name}
                            </h3>
                            {address.isDefault && (
                              <span className="px-2 py-1 text-xs bg-slate-900 text-white rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">
                            {address.line1}
                            {address.line2 && `, ${address.line2}`}
                          </p>
                          <p className="text-sm text-slate-600">
                            {address.city}, {address.state} -{" "}
                            {address.postalCode}
                          </p>
                          <p className="text-sm text-slate-600">
                            {address.country}
                          </p>
                          {address.phoneNumber && (
                            <p className="text-sm text-slate-600 mt-1">
                              Phone: {address.phoneNumber}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!address.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleSetDefaultAddress(address.id)
                              }
                              className="text-slate-600 hover:text-slate-900"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAddressDialog(address)}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LogOut className="h-5 w-5 text-slate-600" />
                <CardTitle>Active Sessions</CardTitle>
              </div>
              <CardDescription>Manage your logged-in sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No active sessions
                </p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="border border-slate-200 rounded-lg p-4 bg-white flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {session.isActive ? "Active Session" : "Expired"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Logged in:{" "}
                          {new Date(session.createdAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Expires:{" "}
                          {new Date(session.expiresAt).toLocaleString()}
                        </p>
                      </div>
                      {session.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLogoutSession(session.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-600">Delete Account</CardTitle>
              </div>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                This action cannot be undone. All your data, orders, and
                addresses will be permanently deleted.
              </p>
              <Button
                variant="outline"
                onClick={() => setDeleteAccountDialogOpen(true)}
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? "Update your address details"
                : "Add a new delivery address"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addressName">Name *</Label>
              <Input
                id="addressName"
                value={addressForm.name}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressPhone">Phone Number</Label>
              <Input
                id="addressPhone"
                value={addressForm.phoneNumber}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    phoneNumber: e.target.value,
                  })
                }
                placeholder="+91 1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="line1">Address Line 1 *</Label>
              <Input
                id="line1"
                value={addressForm.line1}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, line1: e.target.value })
                }
                placeholder="House/Flat No., Building Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="line2">Address Line 2</Label>
              <Input
                id="line2"
                value={addressForm.line2}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, line2: e.target.value })
                }
                placeholder="Street, Area, Landmark"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, city: e.target.value })
                  }
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  id="state"
                  value={addressForm.state}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, state: e.target.value })
                  }
                >
                  <option value="">Select State</option>
                  {STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={addressForm.postalCode}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      postalCode: e.target.value,
                    })
                  }
                  placeholder="123456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={addressForm.country}
                  disabled
                  className="bg-slate-50"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={addressForm.isDefault}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    isDefault: e.target.checked,
                  })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Set as default address
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddressDialogOpen(false);
                resetAddressForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAddress}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {editingAddress ? "Update" : "Add"} Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteAccountDialogOpen}
        onOpenChange={setDeleteAccountDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data will
              be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteAccountDialogOpen(false);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE"}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
