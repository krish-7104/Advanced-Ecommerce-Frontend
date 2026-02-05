"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, UploadCloud, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import apiHelper from "@/lib/axios-helper";
import toast from "react-hot-toast";
import { Category } from "@/types/catalog";
import { slugify } from "@/lib/common";

interface ModifySubcategoryProps {
  subcategory?: Category;
  isOpen?: boolean;
  onClose?: () => void;
  masterData: () => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ModifySubcategoryDialog = ({
  subcategory,
  isOpen,
  onClose,
  masterData,
  setLoading,
}: ModifySubcategoryProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
    parentId: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!subcategory;
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onClose || setInternalOpen;

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await apiHelper.get("/category?level=0");
        if (res?.data?.data) {
          setParentCategories(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch parent categories", error);
      }
    };

    if (open) {
      fetchParents();
    }
  }, [open]);

  useEffect(() => {
    if (subcategory && open) {
      setFormData({
        name: subcategory.name,
        slug: subcategory.slug,
        description: subcategory.description || "",
        isActive: subcategory.isActive ?? true,
        parentId: subcategory.parentId || "",
      });
      // Set existing image if available
      setExistingImageUrl((subcategory as any).image?.url || null);
      setImage(null);
    } else if (!open) {
      setFormData({
        name: "",
        slug: "",
        description: "",
        isActive: true,
        parentId: "",
      });
      setImage(null);
      setExistingImageUrl(null);
    }
  }, [subcategory, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      setExistingImageUrl(null);
    }
  };

  const removeImage = () => {
    setImage(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getImagePreview = () => {
    if (image) {
      return URL.createObjectURL(image);
    }
    return existingImageUrl;
  };

  const createSubcategory = async () => {
    try {
      setLoading(true);
      toast.loading("Creating subcategory...");

      const formDataBody = new FormData();
      formDataBody.append("name", formData.name);
      formDataBody.append("slug", formData.slug);
      formDataBody.append("description", formData.description);
      formDataBody.append("isActive", formData.isActive.toString());
      formDataBody.append("parentId", formData.parentId);
      if (image) {
        formDataBody.append("image", image);
      }

      const resp = await apiHelper.post("/category", formDataBody);
      if (resp.data.statusCode === 201 || resp.data.statusCode === 200) {
        toast.dismiss();
        toast.success("Subcategory Created");
        masterData();
        setFormData({
          name: "",
          slug: "",
          description: "",
          isActive: true,
          parentId: "",
        });
        setImage(null);
        setExistingImageUrl(null);
        setOpen(false);
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to create subcategory"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSubcategory = async () => {
    try {
      setLoading(true);
      toast.loading("Updating subcategory...");

      const formDataBody = new FormData();
      formDataBody.append("name", formData.name);
      formDataBody.append("slug", formData.slug);
      formDataBody.append("description", formData.description);
      formDataBody.append("isActive", formData.isActive.toString());
      formDataBody.append("parentId", formData.parentId);
      if (image) {
        formDataBody.append("image", image);
      }

      const resp = await apiHelper.patch(
        `/category/${subcategory?.id}`,
        formDataBody
      );
      if (resp.data.statusCode === 200) {
        toast.dismiss();
        toast.success("Subcategory Updated");
        masterData();
        setFormData({
          name: "",
          slug: "",
          description: "",
          isActive: true,
          parentId: "",
        });
        setImage(null);
        setExistingImageUrl(null);
        setOpen(false);
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to update subcategory"
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await updateSubcategory();
    } else {
      await createSubcategory();
    }
  };

  const content = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Edit Subcategory" : "Add Subcategory"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update the product subcategory details."
            : "Create a new product subcategory. Parent category is required."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Subcategory Image
          </label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          {getImagePreview() ? (
            <div className="relative w-full h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
              <img
                src={getImagePreview()!}
                alt="Subcategory preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  Click to upload
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, WEBP (Max 5MB)
                </p>
              </div>
            </button>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Parent Category *
          </label>
          <Select
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                parentId: value,
              }));
            }}
            value={formData.parentId}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent category" />
            </SelectTrigger>
            <SelectContent>
              {parentCategories.map((parent) => (
                <SelectItem key={parent.id} value={parent.id}>
                  {parent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Name *
          </label>
          <Input
            name="name"
            placeholder="Subcategory name"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                name: e.target.value,
                slug: slugify(e.target.value),
              }));
            }}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Slug
          </label>
          <Input
            name="slug"
            placeholder="auto-generated if empty"
            value={formData.slug}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                slug: e.target.value,
              }));
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Description
          </label>
          <Textarea
            name="description"
            placeholder="Optional description"
            rows={3}
            value={formData.description}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }));
            }}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Active
          </label>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => {
              setFormData((prev) => ({
                ...prev,
                isActive: !!checked,
              }));
            }}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
        </div>
      </form>
    </DialogContent>
  );

  if (onClose) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus size={16} className="mr-2" />
          Add Subcategory
        </Button>
      </DialogTrigger>
      {content}
    </Dialog>
  );
};

export default ModifySubcategoryDialog;
