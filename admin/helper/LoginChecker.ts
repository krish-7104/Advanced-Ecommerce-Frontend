import apiHelper from "@/lib/axios-helper";
import { removeUserHandler, setUserHandler } from "@/redux/actions";
import { toast } from "sonner";

export const loginChecker = async (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  dispatch: any,
  router: any
) => {
  let loadingToastId: string | number | undefined;
  try {
    setLoading(true);
    loadingToastId = toast.loading("Loading User...");
    const resp = await apiHelper.get("/auth/about/me");
    if (resp?.data?.statusCode == 200) {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      dispatch(setUserHandler(resp?.data?.data));
      return;
    }
  } catch (error: any) {
    if (loadingToastId) {
      toast.dismiss(loadingToastId);
    }
    toast.error(error?.response?.data?.message || "Session Expired");
    dispatch(removeUserHandler());
    router.replace("/login");
  } finally {
    setLoading(false);
  }
};
