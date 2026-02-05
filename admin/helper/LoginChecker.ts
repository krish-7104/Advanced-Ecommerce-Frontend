import apiHelper from "@/lib/axios-helper";
import { removeUserHandler, setUserHandler } from "@/redux/actions";
import toast from "react-hot-toast";

export const loginChecker = async (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  dispatch: any,
  router: any
) => {
  try {
    setLoading(true);
    toast.loading("Loading User...");
    const resp = await apiHelper.get("/auth/about/me");
    if (resp?.data?.statusCode == 200) {
      toast.dismiss();
      dispatch(setUserHandler(resp?.data?.data));
      return;
    }
  } catch (error: any) {
    toast.dismiss();
    toast.error(error?.response?.data?.message || "Session Expired");
    dispatch(removeUserHandler());
    router.replace("/login");
  } finally {
    setLoading(false);
  }
};
