import { useSelector } from "react-redux";

/**
 * Returns true if the current admin has the given permission code.
 * Example: usePermission("categories.create")
 */
export const usePermission = (code: string): boolean => {
  const permissions: string[] = useSelector(
    (state: any) => state?.userData?.permissions ?? [],
  );
  return permissions.includes(code);
};

/**
 * Returns true if the current admin has ANY of the given permission codes.
 * Useful for page-level access: show page if user can do at least one action.
 * Example: usePermissions(["categories.view", "categories.create"])
 */
export const usePermissions = (codes: string[]): boolean => {
  const permissions: string[] = useSelector(
    (state: any) => state?.userData?.permissions ?? [],
  );
  return codes.some((code) => permissions.includes(code));
};

/**
 * Returns the full permissions array for the current admin.
 */
export const useAllPermissions = (): string[] => {
  return useSelector((state: any) => state?.userData?.permissions ?? []);
};
