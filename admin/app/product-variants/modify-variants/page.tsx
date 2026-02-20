"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Folder,
  Trash2,
  Image as ImageIcon,
  Save,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import PageTitle from "@/components/shared/page-title";
import apiHelper from "@/lib/axios-helper";
import { Product, ProductVariant } from "@/types/catalog";
import { getPageMetadata } from "@/constants/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const ModifyVariant = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId");
  const variantId = searchParams.get("variantId");
  const metadata = getPageMetadata("/product/variants");

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [images, setImages] = useState<(any | File)[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [productSearch, setProductSearch] = useState("");

  const [formData, setFormData] = useState({
    productId: productId || "",
    sku: "",
    price: 0,
    mrp: 0,
    stockAvailable: 0,
    isDefault: false,
    isActive: true,
    attributes: {} as Record<string, string>,
  });

  const fetchProduct = async (id: string) => {
    try {
      const res = await apiHelper.get(`/product/${id}`);
      if (res.data?.data) {
        setProduct(res.data.data);
        if (!variantId && res.data.data.attributesSchema) {
          const initialAttrs: Record<string, string> = {};
          const schema = res.data.data.attributesSchema;

          if (Array.isArray(schema)) {
            schema.forEach((attr: any) => {
              initialAttrs[attr.name || attr.key] = "";
            });
          } else if (schema["0"] || schema[0]) {
            Object.values(schema).forEach((attr: any) => {
              initialAttrs[attr.key || attr.name] = "";
            });
          } else {
            // Simple schema format
            Object.entries(schema).forEach(([key, _]) => {
              initialAttrs[key] = "";
            });
          }
          setFormData((prev) => ({ ...prev, attributes: initialAttrs }));
        }
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to fetch product details");
    }
  };

  const fetchVariant = async (id: string) => {
    try {
      setLoading(true);
      toast.loading("Fetching variant...");
      const res = await apiHelper.get(`/product/variants/${id}`);
      if (res.data?.data) {
        const v = res.data.data;
        setVariant(v);
        setDeletedImageIds([]);

        let parsedAttributes = v.attributes || {};
        if (typeof v.attributes === "string") {
          try {
            parsedAttributes = JSON.parse(v.attributes);
          } catch (e) {
            console.error("Failed to parse attributes", e);
          }
        }

        // Handle simple attributes { key: value }
        let formAttributes: Record<string, string> = {};
        if (typeof parsedAttributes === "object" && parsedAttributes !== null) {
          if (parsedAttributes["0"] || parsedAttributes[0]) {
            // Old format
            Object.values(parsedAttributes).forEach((item: any) => {
              formAttributes[item.key] = item.value;
            });
          } else {
            // New simplified format
            formAttributes = parsedAttributes as Record<string, string>;
          }
        }

        setFormData({
          productId: v.productId,
          sku: v.sku,
          price: Number(v.price),
          mrp: v.mrp ? Number(v.mrp) : 0,
          stockAvailable: v.stockAvailable,
          isDefault: v.isDefault,
          isActive: v.isActive,
          attributes: formAttributes,
        });

        if (v.images && Array.isArray(v.images)) {
          setImages(v.images);
          const primaryIdx = v.images.findIndex((img: any) => img.isPrimary);
          if (primaryIdx !== -1) setCoverIndex(primaryIdx);
        }

        if (v.product) {
          setProduct(v.product);
        }
        toast.dismiss();
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to fetch variant details");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const res = await apiHelper.get("/product");
      if (res.data?.data) {
        setProductsList(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  // Generate SKU from product name and selected attributes
  const generateSku = () => {
    if (!product?.name) return "";

    // Start with product name
    let skuParts: string[] = [product.name];

    // Add selected attribute values
    const schema = product.attributesSchema;
    if (schema) {
      let attributeKeys: string[] = [];

      if (Array.isArray(schema)) {
        attributeKeys = schema.map((attr: any) => attr.name || attr.key);
      } else if (schema["0"] || schema[0]) {
        attributeKeys = Object.entries(schema)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([_, attr]: [string, any]) => attr.key || attr.name);
      } else {
        // Simple schema
        attributeKeys = Object.keys(schema);
      }

      // Add attribute values in order
      attributeKeys.forEach((key) => {
        const value = formData.attributes[key];
        if (value) {
          skuParts.push(value);
        }
      });
    }

    // Join with hyphens, uppercase, and replace spaces
    return skuParts.join("-").replaceAll(" ", "-").toUpperCase();
  };

  useEffect(() => {
    fetchProductsList();
    if (variantId) {
      fetchVariant(variantId);
    } else if (productId) {
      fetchProduct(productId);
    }
  }, [variantId, productId]);

  // Auto-generate SKU when product or attributes change (only for new variants)
  useEffect(() => {
    if (!variantId && product) {
      const newSku = generateSku();
      setFormData((prev) => ({ ...prev, sku: newSku }));
    }
  }, [product, formData.attributes, variantId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 10) {
      toast.dismiss();
      toast.error("Maximum 10 images allowed");
      return;
    }

    setImages((prev) => [...prev, ...Array.from(files)]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const item = images[index];
    if (item && "id" in item) {
      setDeletedImageIds((prev) => [...prev, item.id]);
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
    if (index === coverIndex) {
      setCoverIndex(0);
    } else if (index < coverIndex) {
      setCoverIndex(coverIndex - 1);
    }
  };

  const handleSetAsCover = (index: number) => {
    setCoverIndex(index);
  };

  const handleMoveImage = (index: number, direction: "left" | "right") => {
    const newIdx = direction === "left" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;

    setImages((prev) => {
      const newImages = [...prev];
      [newImages[index], newImages[newIdx]] = [
        newImages[newIdx],
        newImages[index],
      ];
      return newImages;
    });

    // Adjust cover index if moving the cover or moving across it
    if (coverIndex === index) {
      setCoverIndex(newIdx);
    } else if (coverIndex === newIdx) {
      setCoverIndex(index);
    }
  };

  const getAttributesPayload = () => {
    // Just return the attributes object as is, cleaned up
    const payload: Record<string, string> = {};
    Object.entries(formData.attributes).forEach(([key, val]) => {
      if (val) payload[key] = val;
    });
    return payload;
  };

  const createNewVariantHandler = async () => {
    const formDataBody = new FormData();
    formDataBody.append("productId", formData.productId);
    formDataBody.append("sku", formData.sku);
    formDataBody.append("price", formData.price.toString());
    formDataBody.append("mrp", formData.mrp.toString());
    formDataBody.append("stockAvailable", formData.stockAvailable.toString());
    formDataBody.append("isDefault", formData.isDefault.toString());
    formDataBody.append("isActive", formData.isActive.toString());
    formDataBody.append("attributes", JSON.stringify(getAttributesPayload()));

    images.forEach((img) => {
      formDataBody.append("images", img);
    });
    formDataBody.append("coverImageIndex", coverIndex.toString());

    return await apiHelper.post(`/product/variants`, formDataBody);
  };

  const patchVariantHandler = async () => {
    const formDataBody = new FormData();
    formDataBody.append("sku", formData.sku);
    formDataBody.append("price", formData.price.toString());
    formDataBody.append("mrp", formData.mrp.toString());
    formDataBody.append("stockAvailable", formData.stockAvailable.toString());
    formDataBody.append("isDefault", formData.isDefault.toString());
    formDataBody.append("isActive", formData.isActive.toString());
    formDataBody.append("attributes", JSON.stringify(getAttributesPayload()));

    const reorderImages: { id: string; order: number }[] = [];
    const newImageOrder: number[] = [];
    let coverFileIndex = -1;
    let fileCounter = 0;

    images.forEach((item, index) => {
      if (item instanceof File) {
        formDataBody.append("images", item);
        newImageOrder.push(index);
        if (index === coverIndex) {
          coverFileIndex = fileCounter;
        }
        fileCounter++;
      } else if (item && item.id) {
        // Only include in reorderImages if the index has changed from the original position
        const originalIndex = variant?.images?.findIndex(
          (img: any) => img.id === item.id,
        );
        if (originalIndex !== index) {
          reorderImages.push({ id: item.id, order: index });
        }
      }
    });

    if (reorderImages.length > 0) {
      formDataBody.append("reorderImages", JSON.stringify(reorderImages));
    }
    if (newImageOrder.length > 0) {
      formDataBody.append("newImageOrder", JSON.stringify(newImageOrder));
    }
    if (deletedImageIds.length > 0) {
      formDataBody.append("deleteImageIds", JSON.stringify(deletedImageIds));
    }

    const selectedCover = images[coverIndex];
    if (selectedCover instanceof File) {
      formDataBody.append("coverImageIndex", coverFileIndex.toString());
    } else if (selectedCover && selectedCover.id) {
      formDataBody.append("coverImageId", selectedCover.id);
    }

    return await apiHelper.patch(
      `/product/variants/${variantId}`,
      formDataBody,
    );
  };

  const handleSubmit = async () => {
    if (!formData.sku || formData.price <= 0) {
      toast.dismiss();
      toast.error("SKU and Price are required");
      return;
    }

    if (product?.attributesSchema) {
      const schema = product.attributesSchema;
      let missing: string[] = [];

      if (Array.isArray(schema)) {
        missing = schema
          .filter((attr: any) => !formData.attributes[attr.name || attr.key])
          .map((attr: any) => attr.name || attr.key);
      } else if (schema["0"] || schema[0]) {
        missing = Object.values(schema)
          .filter((attr: any) => !formData.attributes[attr.key || attr.name])
          .map((attr: any) => attr.key || attr.name);
      }

      if (missing.length > 0) {
        toast.dismiss();
        toast.error(`Please select: ${missing.join(", ")}`);
        return;
      }
    }

    try {
      setLoading(true);
      toast.loading(variantId ? "Updating variant..." : "Creating variant...");

      const res = variantId
        ? await patchVariantHandler()
        : await createNewVariantHandler();

      if (res.status === 200 || res.status === 201) {
        toast.dismiss();
        toast.success(variantId ? "Variant updated" : "Variant created");
        router.push("/product-variants");
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen bg-white">
      <PageTitle
        title={variantId ? "Edit Variant" : "Add New Variant"}
        addBackButton
      />

      <div className="container mx-auto my-4">
        <div className="space-y-4">
          {!variantId && !productId && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Product *
                </label>
                <Select
                  value={formData.productId}
                  onValueChange={(id) => {
                    setFormData((prev) => ({ ...prev, productId: id }));
                    fetchProduct(id);
                  }}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Search and select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5">
                      <Input
                        autoFocus
                        placeholder="Search product..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>
                    {productsList
                      .filter((p) =>
                        p.name
                          .toLowerCase()
                          .includes(productSearch.toLowerCase()),
                      )
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  You must select a product before configuring variant details.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6 w-full">
            <div className="flex flex-col md:flex-row md:items-end md:gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">SKU Code *</label>
                <Input
                  placeholder="e.g., TS-RED-XL"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sku: e.target.value.replaceAll(" ", "-").toUpperCase(),
                    })
                  }
                />
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium cursor-pointer">
                    Default Variant
                  </label>
                  <Switch
                    checked={formData.isDefault}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isDefault: checked })
                    }
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium cursor-pointer">
                    Active
                  </label>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (INR) *</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">MRP (Optional)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.mrp}
                  onChange={(e) =>
                    setFormData({ ...formData, mrp: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Available Stock</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.stockAvailable}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockAvailable: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Attributes Section */}
        {product?.attributesSchema && (
          <div className="space-y-4 mt-8">
            <label className="text-sm font-medium">Variant Attributes *</label>
            <div className="grid md:grid-cols-3 gap-6">
              {(() => {
                const schema = product.attributesSchema;
                if (!schema) return null;

                let items: { key: string; options: string[] }[] = [];

                if (Array.isArray(schema)) {
                  items = schema.map((attr: any) => ({
                    key: attr.name || attr.key,
                    options: attr.options,
                  }));
                } else if (schema["0"] || schema[0]) {
                  items = Object.entries(schema)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([_, attr]: [string, any]) => ({
                      key: attr.key || attr.name,
                      options: attr.options,
                    }));
                } else {
                  // Simple Key-Value Schema
                  items = Object.entries(schema).map(
                    ([key, opts]: [string, any]) => ({
                      key: key,
                      options: Array.isArray(opts) ? opts : [],
                    }),
                  );
                }

                return items.map((attr) => (
                  <div key={attr.key} className="space-y-2">
                    <label className="text-sm font-medium">
                      {attr.key
                        ?.split("_")
                        .map(
                          (item: string) =>
                            item.charAt(0).toUpperCase() + item.slice(1),
                        )
                        .join(" ")}
                    </label>
                    <Select
                      value={formData.attributes[attr.key] || ""}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          attributes: {
                            ...formData.attributes,
                            [attr.key]: val,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder={`Select ${attr.key}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(attr.options) &&
                          attr.options.map((opt: string) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Images Section */}
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Images</h3>
            <span className="text-xs font-normal text-gray-500">
              {images.length}/10 photos
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/10 transition-all flex flex-col items-center justify-center gap-3 group"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || images.length >= 10}
            >
              <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Click to upload images
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Support JPEG, PNG, WEBP (Max 5MB)
                </p>
              </div>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative group aspect-square rounded-xl border border-gray-100 overflow-hidden bg-gray-50"
              >
                <img
                  src={img instanceof File ? URL.createObjectURL(img) : img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 size={14} />
                </button>

                <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {idx > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveImage(idx, "left");
                      }}
                      className="bg-white/90 text-gray-700 p-1 rounded-lg hover:bg-white shadow-sm"
                    >
                      <ChevronLeft size={14} />
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveImage(idx, "right");
                      }}
                      className="bg-white/90 text-gray-700 p-1 rounded-lg hover:bg-white shadow-sm"
                    >
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
                {idx === coverIndex ? (
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-[10px] text-white text-center py-0.5 z-10 font-bold tracking-wider">
                    COVER
                  </div>
                ) : (
                  <button
                    onClick={() => handleSetAsCover(idx)}
                    className="absolute bottom-1 left-1 right-1 bg-white/90 text-[10px] text-gray-700 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-bold hover:bg-white z-10 shadow-sm"
                  >
                    SELECT AS COVER
                  </button>
                )}
              </div>
            ))}
            {images.length === 0 && (
              <div className="col-span-full py-8 flex flex-col items-center justify-center text-gray-400 border border-dashed rounded-xl">
                <ImageIcon size={32} className="mb-2 opacity-50" />
                <p className="text-xs">No images added</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button className="px-8" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              "Please wait..."
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {variantId ? "Update Variant" : "Create Variant"}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ModifyVariant;
