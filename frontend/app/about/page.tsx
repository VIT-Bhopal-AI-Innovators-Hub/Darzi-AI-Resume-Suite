'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import HeroHeader from '@/components/header'
import FooterSection from '@/components/footer'
import { AnimatedGroup } from '@/components/animated-group'
import { ArrowRight, Users, Target, Lightbulb, Globe, Zap } from 'lucide-react'
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

const values = [
    {
        icon: <Target className="h-8 w-8" />,
        title: "Actually Helpful",
        description: "No fluff or fancy features that don't matter. Every tool we build is designed to directly improve your chances of getting interviews."
    },
    {
        icon: <Users className="h-8 w-8" />,
        title: "Free to Use",
        description: "Good resume tools shouldn't cost hundreds of dollars. This project makes AI-powered resume optimization accessible to everyone."
    },
    {
        icon: <Lightbulb className="h-8 w-8" />,
        title: "Smart AI",
        description: "Using the latest language models to understand job requirements and suggest real improvements that recruiters care about."
    },
    {
        icon: <Globe className="h-8 w-8" />,
        title: "Works Everywhere",
        description: "Built to handle different job markets, industries, and experience levels. From students to senior professionals."
    },
    {
        icon: <Users className="h-8 w-8" />,
        title: "User-Focused",
        description: "Built by people who've been through the job search struggle. We know what it's like and what actually helps."
    },
    {
        icon: <Zap className="h-8 w-8" />,
        title: "Always Improving",
        description: "This is an active project. We're constantly adding features and improving based on what job seekers need most."
    }
]

export default function AboutPage() {
    return (
        <div>
            <HeroHeader />
            <main className="overflow-hidden">
                {/* Background Effects */}
                <div
                    aria-hidden
                    className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block">
                    <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>

                {/* Hero Section */}
                <section className="relative pt-24 md:pt-36">
                    <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
                    
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                            <AnimatedGroup variants={transitionVariants}>
                                <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
                                    About{' '}
                                    <span className="relative">
                                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            Darzi AI
                                        </span>
                                    </span>
                                </h1>
                            </AnimatedGroup>

                            <AnimatedGroup variants={transitionVariants}>
                                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                                    A project built to help job seekers like you create better resumes using AI. 
                                    No more struggling with formatting or wondering if your resume will pass ATS systems.
                                </p>
                            </AnimatedGroup>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                    Why We Built This
                                </h2>
                                <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                    Job hunting is tough enough without worrying about resume formatting or whether your skills are presented right. 
                                    We created Darzi AI to solve this problem using advanced language models that understand what recruiters actually look for. 
                                    This project helps you tailor your resume to specific jobs and ensures it passes those tricky ATS systems.
                                </p>
                            </div>
                            
                            {/* Visual Design Element */}
                            <div className="relative">
                                <div className="max-w-sm mx-auto">
                                    {/* Resume Document Illustration */}
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                                        <div className="space-y-4">
                                            {/* Header */}
                                            <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-3">
                                                <div className="w-16 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded mx-auto mb-2"></div>
                                                <div className="w-20 h-2 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
                                            </div>
                                            
                                            {/* Content sections */}
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="w-24 h-3 bg-blue-500 rounded mb-1"></div>
                                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                                                    <div className="w-4/5 h-2 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                                </div>
                                                
                                                <div>
                                                    <div className="w-20 h-3 bg-purple-500 rounded mb-1"></div>
                                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                                                    <div className="w-3/4 h-2 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                                </div>
                                                
                                                <div>
                                                    <div className="w-16 h-3 bg-indigo-500 rounded mb-1"></div>
                                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                                                    <div className="w-5/6 h-2 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* AI Enhancement Effect */}
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                            <Zap className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    
                                    {/* Floating improvements */}
                                    <div className="absolute -bottom-4 -left-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                                        ATS Optimized ✓
                                    </div>
                                    <div className="absolute -top-4 -right-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                                        AI Enhanced ✓
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                                <div className="flex flex-col">
                                    <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                        The Problem
                                    </dt>
                                    <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                                        <p className="flex-auto">
                                            Most resumes get rejected by ATS systems before humans even see them. Many job seekers don't know 
                                            how to optimize their resumes for specific roles or understand what keywords recruiters are looking for.
                                        </p>
                                    </dd>
                                </div>
                                <div className="flex flex-col">
                                    <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                        Our Approach
                                    </dt>
                                    <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                                        <p className="flex-auto">
                                            Using AI and machine learning, this tool analyzes job descriptions and helps you tailor your resume accordingly. 
                                            It suggests improvements, optimizes for ATS systems, and even generates professional templates.
                                        </p>
                                    </dd>
                                </div>
                                <div className="flex flex-col">
                                    <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                        The Result
                                    </dt>
                                    <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                                        <p className="flex-auto">
                                            Better resumes that actually get noticed. Whether you're a student, changing careers, or just want to 
                                            improve your current resume, this tool helps level the playing field in today's competitive job market.
                                        </p>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900/50">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                What Drives This Project
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                These principles guide how we build features that actually help you land interviews.
                            </p>
                        </div>
                        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-3">
                                {values.map((value, index) => (
                                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800">
                                        <CardHeader>
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white mb-4">
                                                {value.icon}
                                            </div>
                                            <CardTitle className="text-xl">{value.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-gray-600 dark:text-gray-300">
                                                {value.description}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                Built by Students, for Job Seekers
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                This project was created by AI enthusiasts who understand the job search struggle firsthand.
                            </p>
                        </div>
                        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24">
                            <div className="text-center">
                                <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1">
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-gray-900">
                                        <Image
                                            src="/logo.png"
                                            alt="VIT Bhopal AI Innovators Hub"
                                            width={60}
                                            height={60}
                                            className="h-15 w-15 object-contain"
                                        />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    VIT Bhopal AI Innovators Hub
                                </h3>
                                <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">
                                    Student Project Team
                                </p>
                                <p className="max-w-lg mx-auto text-gray-600 dark:text-gray-300">
                                    A group of AI enthusiasts and developers from VIT Bhopal who got tired of seeing great candidates get rejected because of poor resume formatting. We built this to help.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900/50">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                Ready to Improve Your Resume?
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                Try our AI-powered resume builder and see how it can help you land more interviews.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Button size="lg" asChild className="group">
                                    <Link href="/Dashboard">
                                        Try the Resume Builder
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                                <Button variant="outline" size="lg" asChild>
                                    <Link href="https://www.linkedin.com/company/vitb-aih/" target="_blank" rel="noopener noreferrer">
                                        Follow Our Work
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <FooterSection />
        </div>
    )
}
