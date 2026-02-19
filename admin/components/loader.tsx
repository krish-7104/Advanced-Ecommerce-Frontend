import { Loader2 } from "lucide-react";
import React from "react";

const LoaderComp = () => {
  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default LoaderComp;
