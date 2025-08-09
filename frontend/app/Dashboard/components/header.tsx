import { User, Settings, Search, Bell } from 'lucide-react';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Header() {
    return (
        <header className="flex justify-between items-center p-4">
            <div>
                <p className="text-xs text-gray-400">Alex / Dashboard</p>
                <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            </div>
        <div className="flex items-center bg-white/5 backdrop-blur-lg border border-white/10 rounded-full p-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Type here..." className="bg-transparent pl-9 text-sm focus:outline-none text-white" />
            </div>
            <div className="flex items-center space-x-4 ml-4">
                <SignedOut>
                    <Link href="/sign-in" className="flex items-center text-sm text-gray-300 hover:text-white">
                        <User className="h-4 w-4 mr-1" />
                        Sign In
                    </Link>
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <a href="#"><Settings className="h-5 w-5 text-gray-400 hover:text-white active:animate-spin" /></a> {/* I like the spin animation, dont remove it. -Abhash */}
                <a href="#"><Bell className="h-5 w-5 text-gray-400 hover:text-white" /></a>
            </div>
        </div>
    </header>
);
}