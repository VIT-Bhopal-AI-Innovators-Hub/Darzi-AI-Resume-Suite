import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { TextEffect } from '@/components/text-effect'
import { AnimatedGroup } from '@/components/animated-group'
import HeroHeader from "@/components/header"
import type { Variants } from 'framer-motion'

const transitionVariants: { item: Variants } = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    }
}

export default function HeroSection() {
    return (
        <>
            <div className="min-h-screen w-full bg-black relative">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        background: "#000000",
                        backgroundImage: `
                            linear-gradient(to right, rgba(75, 85, 99, 0.4) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(75, 85, 99, 0.4) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                    }}
                />
                <div className="relative z-10">
                    <HeroHeader />
                    <main className="overflow-hidden">
                        <div
                            aria-hidden
                            className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block">
                            <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                            <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                            <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                        </div>
                        <section>
                            <div className="relative pt-24 md:pt-36">
                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    delayChildren: 1,
                                                },
                                            },
                                        },
                                        item: {
                                            hidden: {
                                                opacity: 0,
                                                y: 20,
                                            },
                                            visible: {
                                                opacity: 1,
                                                y: 0,
                                                transition: {
                                                    type: 'spring',
                                                    bounce: 0.3,
                                                    duration: 2,
                                                },
                                            },
                                        },
                                    }}
                                    className="absolute inset-0 -z-20">
                                    <Image
                                        src="/Hero Gradients_001.png"
                                        alt="background"
                                        className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block w-full h-full object-cover"
                                        width={1920}
                                        height={1080}
                                        priority 
                                    />
                                </AnimatedGroup>
                                <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
                                <div className="mx-auto max-w-7xl px-6">
                                    <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                        <AnimatedGroup variants={transitionVariants}>
                                            <Link
                                                href="#link"
                                                className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                                <span className="text-foreground text-sm">AI-Powered Resume Generation</span>
                                                <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                                <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                        <span className="flex size-6">
                                                            <ArrowRight className="m-auto size-3" />
                                                        </span>
                                                        <span className="flex size-6">
                                                            <ArrowRight className="m-auto size-3" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </AnimatedGroup>

                                        <TextEffect
                                            preset="fade-in-blur"
                                            speedSegment={0.3}
                                            as="h1"
                                            className="mt-8 text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] text-white">
                                            Align Your Resume With the Job, Instantly
                                        </TextEffect>
                                        
                                        <TextEffect
                                            per="line"
                                            preset="fade-in-blur"
                                            speedSegment={0.3}
                                            delay={0.5}
                                            as="p"
                                            className="mx-auto mt-8 max-w-2xl text-balance text-lg text-gray-300">
                                            Beat ATS systems, optimize your resume content, and land your dream job with our advanced AI parsing technology trusted by professionals worldwide.
                                        </TextEffect>

                                        <AnimatedGroup
                                            variants={{
                                                container: {
                                                    visible: {
                                                        transition: {
                                                            staggerChildren: 0.05,
                                                            delayChildren: 0.75,
                                                        },
                                                    },
                                                },
                                                ...transitionVariants,
                                            }}
                                            className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                            <div
                                                key={1}
                                                className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
                                                <Button
                                                    asChild
                                                    size="lg"
                                                    className="rounded-xl px-5 text-base">
                                                    <Link href="/dashboard">
                                                        <span className="text-nowrap">Dashboard</span>
                                                    </Link>
                                                </Button>
                                            </div>
                                            <Button
                                                key={2}
                                                asChild
                                                size="lg"
                                                variant="ghost"
                                                className="h-10.5 rounded-xl px-5 text-white hover:bg-white/10">
                                                <Link href="#link">
                                                    <span className="text-nowrap">Request a demo</span>
                                                </Link>
                                            </Button>
                                        </AnimatedGroup>
                                    </div>
                                </div>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}>
                                    <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                        <div
                                            aria-hidden
                                            className="bg-linear-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                        />
                                        <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                                            <Image
                                                className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
                                                src="/bg.jpg"
                                                alt="app screen"
                                                width="2700"
                                                height="1440"
                                                priority
                                            />
                                            <Image
                                                className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
                                                src="/bg.jpg"
                                                alt="app screen"
                                                width="2700"
                                                height="1440"
                                                priority
                                            />
                                        </div>
                                    </div>
                                </AnimatedGroup>
                            </div>
                        </section>                
                    </main>
                </div>
            </div>
        </>
    )
}