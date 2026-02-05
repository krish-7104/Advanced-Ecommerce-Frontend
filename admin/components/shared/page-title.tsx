import React, { ReactElement } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft } from "lucide-react";

const PageTitle = ({
  title,
  icon,
  addBackButton,
}: {
  title: String;
  icon?: ReactElement;
  addBackButton?: boolean;
}) => {
  const router = useRouter();
  return (
    <div className="w-full bg-[#f6f6f6] sticky z-50 py-4 top-0 rounded-br-2xl shadow-md">
      <div className="mx-auto container flex">
        {addBackButton && (
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ChevronLeft size={26} />
          </Button>
        )}
        <p className="font-bold text-2xl flex justify-start items-center">
          {icon ? <span className="mr-2">{icon}</span> : null} {title}
        </p>
      </div>
    </div>
  );
};
export default PageTitle;
