"use client";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
const GREETINGS = {
  morning: "Good Morning",
  afternoon: "Good Afternoon",
  evening: "Good Evening",
};


const Home = () => {
  const [greet, setGreeting] = useState(GREETINGS.morning);
  const userData = useSelector((state: any) => state?.userData);
  useEffect(() => {
    getGreetText();
  }, []);

  const getGreetText = () => {
    const hour = new Date().getHours();
    if (hour <= 12) {
      setGreeting(GREETINGS.morning);
    } else if (hour <= 18) {
      setGreeting(GREETINGS.afternoon);
    } else {
      setGreeting(GREETINGS.evening);
    }
  };


  return (
    <main className="mx-auto bg-[#f6f6f6] flex justify-center h-[100vh] container overflow-x-hidden">
      {userData && (
        <section className="mt-6 w-[92%]">
          <div className="w-full mb-4">
            <p className="font-semibold text-xl">
              {`${greet}, ${userData?.name || ""}`}
            </p>
            <p className="text-sm mt-1 text-slate-500">
              Here what&lsquo;s happening with your store
            </p>
          </div>

        </section>
      )}
      {!userData && (
        <div className="flex justify-center items-center flex-col">
          <Loader2 className="animate-spin" />
          <p className="mt-2 text-gray-700">Getting Things Ready!</p>
        </div>
      )}
    </main>
  );
};

export default Home;
