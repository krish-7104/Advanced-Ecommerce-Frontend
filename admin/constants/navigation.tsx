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
} from "lucide-react";

export interface NavItem {
    title: string;
    route: string;
    icon: LucideIcon;
}

export interface NavSection {
    section: string;
    items: NavItem[];
}

export const navigationConfig: NavSection[] = [
    {
        section: "General",
        items: [{ title: "Dashboard", route: "/", icon: Home }],
    },
    {
        section: "Catalog",
        items: [
            { title: "Categories", route: "/category", icon: Folder },
            { title: "Subcategories", route: "/sub-categories", icon: FolderTree },
            { title: "Products", route: "/products", icon: Package },
            { title: "Product Variants", route: "/product-variants", icon: Layers },
        ],
    },
    {
        section: "Operations",
        items: [
            { title: "Orders", route: "/orders", icon: ShoppingCart },
            { title: "Users", route: "/users", icon: Users },
            { title: "Admins", route: "/admin", icon: Shield },
        ],
    },
    {
        section: "System",
        items: [
            { title: "Logs", route: "/logs", icon: Activity },
            { title: "Settings", route: "/settings", icon: Settings },
        ],
    },
];

// Helper to get flat items for easy lookup
export const flatNavigation = navigationConfig.flatMap((section) => section.items);

// Helper to get metadata by route
export const getPageMetadata = (route: string) => {
    return flatNavigation.find((item) => item.route === route);
};
