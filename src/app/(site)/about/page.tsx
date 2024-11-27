import React from "react";
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
    const techStack: Record<string, TechStackItem[]> = {
        frontend: [
            { name: "Next.js 15", description: "React framework for production", url: "https://nextjs.org" },
            { name: "React 18", description: "UI library", url: "https://react.dev" },
            { name: "TypeScript", description: "Type-safe JavaScript", url: "https://www.typescriptlang.org" },
            { name: "Tailwind CSS", description: "Utility-first CSS framework", url: "https://tailwindcss.com" },
            { name: "shadcn/ui", description: "Re-usable components", url: "https://ui.shadcn.com" }
        ],
        backend: [
            { name: "Next.js API Routes", description: "Backend API endpoints", url: "https://nextjs.org/docs/api-routes/introduction" },
            { name: "Prisma", description: "Type-safe database ORM", url: "https://www.prisma.io" },
            { name: "PostgreSQL", description: "Database", url: "https://www.postgresql.org" },
            { name: "NextAuth.js", description: "Authentication", url: "https://next-auth.js.org" }
        ],
        features: [
            { name: "GitHub OAuth", description: "Login with GitHub" },
            { name: "Markdown Support", description: "Cherry Markdown & Unified" },
            { name: "Code Highlighting", description: "rehype-pretty-code & Shiki" },
            { name: "Math Equations", description: "KaTeX integration" },
            { name: "Comments", description: "Giscus GitHub Discussions" }
        ],
        deployment: [
            { name: "Docker", description: "Containerization" },
            { name: "GitHub Actions", description: "CI/CD pipeline" },
            { name: "GitHub Webhook", description: "Auto deployment" }
        ]
    };

    const categoryIcons = {
        frontend: <Terminal className="h-5 w-5" />,
        backend: <Globe className="h-5 w-5" />,
        features: <Rocket className="h-5 w-5" />,
        deployment: <Github className="h-5 w-5" />
    };

    return (
        <main className="min-h-[calc(100vh-88px)] p-6 md:p-8 animate-fade-up">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Hero Section */}
                <section className="text-center space-y-4 py-8">
                    <h1 className="text-4xl md:text-5xl font-bold leading-[1.4] pb-1 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                        About Oveln Blog
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        A modern blog platform built with Next.js and TypeScript, featuring a clean design
                        and powerful features for content creation and management.
                    </p>
                </section>

                {/* Tech Stack Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(techStack).map(([category, items]) => (
                        <Card key={category} className="shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 capitalize">
                                    {categoryIcons[category as keyof typeof categoryIcons]}
                                    {category}
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
                        Key Features
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            {
                                title: "Modern Design",
                                description: "Responsive layout with dark mode support"
                            },
                            {
                                title: "Secure Authentication",
                                description: "GitHub OAuth integration for user management"
                            },
                            {
                                title: "Rich Content Editing",
                                description: "Advanced markdown editor with preview"
                            },
                            {
                                title: "Version Control",
                                description: "Track and manage post revisions"
                            },
                            {
                                title: "Admin Dashboard",
                                description: "Comprehensive content management system"
                            },
                            {
                                title: "Automated Deployment",
                                description: "Streamlined CI/CD with GitHub Actions"
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
