import { cn } from "@/shared/utils";
import { type HTMLAttributes } from "react";

interface MainContainerProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

const MainContainer = ({
  children,
  className,
  ...props
}: MainContainerProps) => {
  return (
    <main
      className={cn(
        `flex min-h-screen flex-col items-center gap-4 bg-gradient-to-b from-[#2e026d] to-[#15162c] p-2 text-white sm:gap-6 sm:p-4 lg:gap-8 lg:p-8`,
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
};

export default MainContainer;
