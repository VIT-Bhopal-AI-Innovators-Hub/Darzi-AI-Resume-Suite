import { cn } from '../lib/utils'
import Image from 'next/image'

export const Logo = ({ className }: { className?: string }) => {
    return (
        <Image
            src="/logo.png"
            alt="Logo"
            width={112}
            height={24}
            className={cn('h-5 w-auto', className)}
            priority
        />
    )
}

export const LogoIcon = ({ className }: { className?: string }) => {
    return (
        <Image
            src="/logo.png"
            alt="Logo"
            width={20}
            height={20}
            className={cn('size-5', className)}
        />
    )
}

export const LogoStroke = ({ className }: { className?: string }) => {
    return (
        <Image
            src="/logo.png"
            alt="Logo"
            width={28}
            height={28}
            className={cn('size-7 w-7', className)}
        />
    )
}