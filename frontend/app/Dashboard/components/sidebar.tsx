import React, { useState } from "react";
import { Logo } from "@/components/logo";
import Link from "next/link";
import {
  Home,
  FileText,
  User,
  Settings,
  HelpCircle,
  Menu,
  Target,
  LayoutTemplate,
} from "lucide-react";
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NavItem = ({
  icon,
  children,
  href,
  active = false,
  isCollapsed = false,
  href,
}: {
  icon: React.ReactElement;
  children: React.ReactNode;
  href?: string;
  active?: boolean;
  isCollapsed?: boolean;
  href: string;
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
      className={`p-1.5 ${isCollapsed ? "" : "mr-3"} rounded-lg transition-colors duration-300 ${
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

const DisabledNavItem = ({
  icon,
  label,
  isCollapsed = false,
}: {
  icon: React.ReactElement;
  label: string;
  isCollapsed?: boolean;
}) => (
  <div
    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 text-gray-500 bg-transparent border border-transparent opacity-60 cursor-not-allowed ${
      isCollapsed ? "justify-center" : ""
    }`}
    title={`${label} (Coming Soon)`}
  >
    <div className={`p-1.5 ${isCollapsed ? "" : "mr-3"} rounded-lg bg-gray-800`}>
      {React.cloneElement(icon, {
        className: "h-5 w-5 text-gray-400",
      } as React.HTMLAttributes<SVGElement>)}
    </div>
    {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
  </div>
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
            <h1 className="text-2xl font-bold text-white tracking-wider whitespace-nowrap">
              <Logo className="mr-2 inline-block" />
              DARZI
            </h1>
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

            <NavItem icon={<Home />} href="/Dashboard" active={pathname === '/Dashboard'} isCollapsed={isCollapsed}>
              Dashboard
            </NavItem>
            <NavItem icon={<FileText />} href="/resume-editor" active={pathname === '/resume-editor'} isCollapsed={isCollapsed}>
              Resume Editor
            </NavItem>
            <DisabledNavItem icon={<Target />} label="ATS Checker" isCollapsed={isCollapsed} />
            <NavItem icon={<BarChart3 />} href="/Dashboard/templates" isCollapsed={isCollapsed}>
              Templates
            </NavItem>
            {/* Account section - always stays below main nav item
            <div className="mt-6">
              {!isCollapsed && (
                <p className="text-xs font-bold uppercase text-gray-500 mb-2 px-4 whitespace-nowrap">
                  Account
                </p>
              )}
              <NavItem icon={<User />} href="/Dashboard" isCollapsed={isCollapsed}>
                Profile
              </NavItem>
              <NavItem icon={<Settings />} href="/Dashboard" isCollapsed={isCollapsed}>
                Settings
              </NavItem> */}
          </nav>
        </div>

        {/* Help box - always at bottom */}
        <div className={`mt-auto ${isCollapsed ? "hidden" : "block"}`}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-white text-center relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>
            <div className="relative z-10">
              <HelpCircle className="mx-auto h-10 w-10 mb-3" />
              <h3 className="font-bold">Need help?</h3>
              <p className="text-xs mt-1 mb-3">Please check our docs</p>
              <button className="bg-white hover:bg-gray-200 text-black font-bold text-xs py-2 px-4 rounded-lg w-full transition-colors">
                DOCUMENTATION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}