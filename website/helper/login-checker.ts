import { toast } from "sonner";
import apiHelper from "./axios-helper";
import { logout, setUser } from "@/redux/slices/user.slice";

export const loginChecker = async (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  dispatch: any,
  router: any,
  skipRedirect: boolean = false
) => {
  try {
    setLoading(true);
    toast.loading("Loading User...");
    const resp = await apiHelper.get("/auth/about/me?cartCount=true");
    if (resp?.data?.statusCode == 200) {
      toast.dismiss();
      dispatch(setUser(resp?.data?.data));
      return;
    }
  } catch (error: any) {
    toast.dismiss();
    if (!skipRedirect) {
      toast.error(error?.response?.data?.message || "Session Expired");
      dispatch(logout());
      router.replace("/login");
    } else {
      dispatch(logout());
    }
  } finally {
    setLoading(false);
  }
};
