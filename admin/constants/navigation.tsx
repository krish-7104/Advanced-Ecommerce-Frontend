import {
  Home,
  LayoutGrid,
  Boxes,
  Package,
  ShoppingCart,
  Users,
  Shield,
  Activity,
  Settings,
  LucideIcon,
  FolderTree,
  Folder,
  Layers,
  ShieldCheck,
  Building2,
} from "lucide-react";

export interface NavItem {
  title: string;
  route: string;
  icon: LucideIcon;
  permissions?: string[];
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export const navigationConfig: NavSection[] = [
  {
    section: "General",
    items: [
      {
        title: "Dashboard",
        route: "/",
        icon: Home,
        permissions: ["dashboard.view", "dashboard.download"],
      },
    ],
  },
  {
    section: "Catalog",
    items: [
      {
        title: "Categories",
        route: "/category",
        icon: Folder,
        permissions: [
          "categories.view",
          "categories.create",
          "categories.update",
          "categories.delete",
        ],
      },
      {
        title: "Subcategories",
        route: "/sub-categories",
        icon: FolderTree,
        permissions: [
          "sub-categories.view",
          "sub-categories.create",
          "sub-categories.update",
          "sub-categories.delete",
        ],
      },
      {
        title: "Products",
        route: "/products",
        icon: Package,
        permissions: [
          "products.view",
          "products.create",
          "products.update",
          "products.delete",
        ],
      },
      {
        title: "Product Variants",
        route: "/product-variants",
        icon: Layers,
        permissions: [
          "product-variants.view",
          "product-variants.create",
          "product-variants.update",
          "product-variants.delete",
        ],
      },
    ],
  },
  {
    section: "Operations",
    items: [
      {
        title: "Orders",
        route: "/orders",
        icon: ShoppingCart,
        permissions: ["orders.view", "orders.update"],
      },
      {
        title: "Users",
        route: "/users",
        icon: Users,
        permissions: [
          "users.view",
          "users.create",
          "users.update",
          "users.delete",
        ],
      },
    ],
  },
  {
    section: "Access Control",
    items: [
      {
        title: "Admins",
        route: "/settings/admins",
        icon: Shield,
        permissions: [
          "admins.view",
          "admins.create",
          "admins.update",
          "admins.delete",
        ],
      },
    ],
  },
  {
    section: "System",
    items: [
      {
        title: "Logs",
        route: "/logs",
        icon: Activity,
        permissions: ["logs.view", "logs.create", "logs.update", "logs.delete"],
      },
    ],
  },
];

// Helper to get flat items for easy lookup
export const flatNavigation = navigationConfig.flatMap(
  (section) => section.items,
);

// Helper to get metadata by route
export const getPageMetadata = (route: string) => {
  return flatNavigation.find((item) => item.route === route);
};
