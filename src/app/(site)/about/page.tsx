"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Globe, Rocket, Terminal } from "lucide-react";

interface TechStackItem {
    name: string;
    description: string;
    url?: string;
    new?: boolean;
}

export default function About() {
    const [language] = useState('zh');

    const techStack: Record<string, TechStackItem[]> = {
        frontend: [
            { name: "Next.js 15", description: language === 'en' ? "React framework for production" : "用于生产的 React 框架", url: "https://nextjs.org" },
            { name: "React 18", description: language === 'en' ? "UI library" : "UI 库", url: "https://react.dev" },
            { name: "TypeScript", description: language === 'en' ? "Type-safe JavaScript" : "类型安全的 JavaScript", url: "https://www.typescriptlang.org" },
            { name: "Tailwind CSS", description: language === 'en' ? "Utility-first CSS framework" : "实用优先的 CSS 框架", url: "https://tailwindcss.com" },
            { name: "shadcn/ui", description: language === 'en' ? "Re-usable components" : "可重用组件", url: "https://ui.shadcn.com" }
        ],
        backend: [
            { name: "Next.js API Routes", description: language === 'en' ? "Backend API endpoints" : "后端 API 端点", url: "https://nextjs.org/docs/api-routes/introduction" },
            { name: "Prisma", description: language === 'en' ? "Type-safe database ORM" : "类型安全的数据库 ORM", url: "https://www.prisma.io" },
            { name: "PostgreSQL", description: language === 'en' ? "Database" : "数据库", url: "https://www.postgresql.org" },
            { name: "NextAuth.js", description: language === 'en' ? "Authentication" : "身份认证", url: "https://next-auth.js.org" }
        ],
        features: [
            { name: "GitHub OAuth", description: language === 'en' ? "Login with GitHub" : "使用 GitHub 登录" },
            { name: "Markdown Support", description: language === 'en' ? "Cherry Markdown & Unified" : "Cherry Markdown 和 Unified 支持" },
            { name: "Code Highlighting", description: language === 'en' ? "rehype-pretty-code & Shiki" : "使用 rehype-pretty-code 和 Shiki 的代码高亮" },
            { name: "Math Equations", description: language === 'en' ? "KaTeX integration" : "KaTeX 数学公式支持" },
            { name: "Comments", description: language === 'en' ? "Giscus GitHub Discussions" : "基于 GitHub Discussions 的 Giscus 评论" }
        ],
        deployment: [
            { name: "Docker", description: language === 'en' ? "Containerization" : "容器化" },
            { name: "GitHub Actions", description: language === 'en' ? "CI/CD pipeline" : "CI/CD 流水线" },
            { name: "GitHub Webhook", description: language === 'en' ? "Auto deployment" : "自动部署" }
        ]
    };

    const categoryIcons = {
        frontend: <Terminal className="h-5 w-5" />,
        backend: <Globe className="h-5 w-5" />,
        features: <Rocket className="h-5 w-5" />,
        deployment: <Github className="h-5 w-5" />
    };

    return (
        <main className="min-h-[calc(100vh-56px)] p-6 md:p-8 animate-fade-up">
            <div className="max-w-5xl mx-auto space-y-12">

                {/* Hero Section */}
                <section className="text-center space-y-4 py-8">
                    <h1 className="text-4xl md:text-5xl font-bold leading-[1.4] pb-1 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                        {language === 'en' ? 'About Oveln Blog' : '关于 Oveln Blog'}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {language === 'en' ?
                            'A modern blog platform built with Next.js and TypeScript, featuring a clean design and powerful features for content creation and management.' :
                            '一个使用 Next.js 和 TypeScript 构建的现代博客平台，具有简洁的设计和强大的内容创建和管理功能。'}
                    </p>
                </section>

                {/* Tech Stack Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(techStack).map(([category, items]) => (
                        <Card key={category} className="shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 capitalize">
                                    {categoryIcons[category as keyof typeof categoryIcons]}
                                    {language === 'en' ? category : translateCategory(category)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {items.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Badge
                                                variant="secondary"
                                                className="group relative cursor-pointer transition-all hover:scale-105"
                                            >
                                                {item.name}
                                                {'new' in item && item.new && (
                                                    <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-green-500" />
                                                )}
                                                <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg transition-all duration-200">
                                                    {item.description}
                                                </span>
                                            </Badge>
                                        </a>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Features Section */}
                <section className="space-y-6 bg-muted/50 rounded-lg p-6">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <Rocket className="h-6 w-6" />
                        {language === 'en' ? 'Key Features' : '主要功能'}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            {
                                title: language === 'en' ? "Modern Design" : "现代设计",
                                description: language === 'en' ? "Responsive layout with dark mode support" : "响应式布局，支持暗模式"
                            },
                            {
                                title: language === 'en' ? "Secure Authentication" : "安全认证",
                                description: language === 'en' ? "GitHub OAuth integration for user management" : "GitHub OAuth 集成用户管理"
                            },
                            {
                                title: language === 'en' ? "Rich Content Editing" : "丰富的内容编辑",
                                description: language === 'en' ? "Advanced markdown editor with preview" : "高级 Markdown 编辑器，带预览"
                            },
                            {
                                title: language === 'en' ? "Version Control" : "版本控制",
                                description: language === 'en' ? "Track and manage post revisions" : "跟踪和管理帖子修订"
                            },
                            {
                                title: language === 'en' ? "Admin Dashboard" : "管理仪表板",
                                description: language === 'en' ? "Comprehensive content management system" : "全面的内容管理系统"
                            },
                            {
                                title: language === 'en' ? "Automated Deployment" : "自动化部署",
                                description: language === 'en' ? "Streamlined CI/CD with GitHub Actions" : "使用 GitHub Actions 简化 CI/CD"
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-lg bg-card shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <h3 className="font-semibold mb-1">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

function translateCategory(category: string): string {
    const translations: Record<string, string> = {
        frontend: "前端",
        backend: "后端",
        features: "功能",
        deployment: "部署"
    };
    return translations[category] || category;
}
