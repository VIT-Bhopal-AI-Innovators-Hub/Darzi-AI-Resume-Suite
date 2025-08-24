import { User, Settings, Search, Bell } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";

interface HeaderProps {
  pageName?: string;
}

export default function Header({ pageName = "Dashboard" }: HeaderProps) {
  // const { user, isLoaded } = useUser();
  // const firstName = !isLoaded ? "Loading..." : user?.firstName || "User";
  return (
    <header className="flex justify-between items-center p-4">
      <div>
        <p className="text-xs text-gray-400">
          /{pageName.toLowerCase()}
        </p>
        <h2 className="text-3xl font-bold text-white">{pageName}</h2>
      </div>
      <div className="flex items-center backdrop-blur-lg border border-gray rounded-full p-2">
        <div className="flex items-center space-x-4">
          <SignedOut>
            <Link
              href="/sign-in"
              className="flex items-center text-sm text-gray-300 hover:text-white"
            >
              <User className="h-4 w-4 mr-1" />
              Sign In
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}