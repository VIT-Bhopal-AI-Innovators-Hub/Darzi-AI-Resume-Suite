import React, { useState } from "react";
import {
  Home,
  FileText,
  FilePlus2,
  // User,
  // Settings,
  // HelpCircle,
  Menu,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoFull } from "../logo";

const NavItem = ({
  icon,
  children,
  active = false,
  isCollapsed = false,
  href,
}: {
  icon: React.ReactElement;
  children: React.ReactNode;
  href: string;
  active?: boolean;
  isCollapsed?: boolean;
}) => (
  <Link
    href={href}
    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
      active
        ? "bg-gray-200 text-black"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    } ${isCollapsed ? "justify-center" : ""}`}
    title={isCollapsed ? children?.toString() : undefined}
  >
    <div
      className={`p-1.5 ${
        isCollapsed ? "" : "mr-3"
      } rounded-lg transition-colors duration-300 ${
        active ? "bg-black" : "bg-gray-700"
      }`}
    >
      {React.cloneElement(icon, {
        className: `h-5 w-5 text-white`,
      } as React.HTMLAttributes<SVGElement>)}
    </div>
    {!isCollapsed && (
      <span className="whitespace-nowrap overflow-hidden transition-all duration-300 opacity-100">
        {children}
      </span>
    )}
  </Link>
);

export default function Sidebar({
  onToggle,
}: {
  onToggle?: (collapsed: boolean) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname(); // active route

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle?.(newState);
  };

  return (
    <div
      className={`fixed left-0 top-0 h-screen z-40 bg-white/5 backdrop-blur-lg border-r border-white/10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="relative h-full flex flex-col justify-between p-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center mb-8 relative h-12">
          {!isCollapsed ? (
            <LogoFull className="mr-2 inline-block" />
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="absolute right-0 p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation - Scrollable area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <nav className="space-y-2">
            <NavItem
              icon={<Home />}
              href="/dashboard"
              active={pathname === "/dashboard"}
              isCollapsed={isCollapsed}
            >
              Dashboard
            </NavItem>
            <NavItem
              icon={<FilePlus2 />}
              href="/generate-resume"
              active={pathname === "/generate-resume"}
              isCollapsed={isCollapsed}
            >
              Generate Resume
            </NavItem>
            <NavItem
              icon={<FileText />}
              href="/latexLive"
              active={pathname === "/latexLive"}
              isCollapsed={isCollapsed}
            >
              Resume Editor
            </NavItem>
            <NavItem
              icon={<Target />}
              href="/ats-checker"
              active={pathname === "/ats-checker"}
              isCollapsed={isCollapsed}
            >
              ATS Checker
            </NavItem>
            {/* <NavItem
              icon={<BarChart3 />}
              href="/templates"
              active={pathname === "/templates"}
              isCollapsed={isCollapsed}
            >
              Templates
            </NavItem> */}
            {/* <DisabledNavItem
              icon={<Target />}
              label="ATS Checker"
              isCollapsed={isCollapsed}
            /> */}
            {/* Account section - always stays below main nav item
            <div className="mt-6">
              {!isCollapsed && (
                <p className="text-xs font-bold uppercase text-gray-500 mb-2 px-4 whitespace-nowrap">
                  Account
                </p>
              )}
              <NavItem icon={<User />} href="/dashboard" isCollapsed={isCollapsed}>
                Profile
              </NavItem>
              <NavItem icon={<Settings />} href="/dashboard" isCollapsed={isCollapsed}>
                Settings
              </NavItem> */}
          </nav>
        </div>

        {/* Help box - always at bottom */}
        <div className={`mt-auto ${isCollapsed ? "hidden" : "block"}`}>
          <a
            href="https://github.com/VIT-Bhopal-AI-Innovators-Hub/Darzi-AI-Resume-Suite"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <button className="bg-white hover:bg-gray-200 text-black font-bold text-xs py-2 px-4 rounded-lg w-full transition-colors flex items-center justify-center gap-2">
              {/* GitHub Logo SVG */}
              <svg
                aria-hidden="true"
                focusable="false"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.01-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.12 3.04.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z" />
              </svg>
              Star on GitHub
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
