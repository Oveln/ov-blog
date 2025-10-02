"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface App {
    id: string;
    name: string;
    url: string;
    description: string;
}

export default function AppsPage() {
    const [apps, setApps] = useState<App[]>([]);
    const [newApp, setNewApp] = useState({ name: "", url: "", description: "" });
    const [isOpen, setIsOpen] = useState(false);
    const [appToDelete, setAppToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            const response = await fetch("/api/apps");
            if (response.ok) {
                const data = await response.json();
                setApps(data);
            }
        } catch (error) {
            console.error("Error fetching apps:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/apps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newApp),
            });

            if (response.ok) {
                setNewApp({ name: "", url: "", description: "" });
                setIsOpen(false);
                fetchApps();
            }
        } catch (error) {
            console.error("Error creating app:", error);
        }
    };

    const handleDeleteApp = async (id: string) => {
        try {
            const response = await fetch(`/api/apps/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchApps();
                setAppToDelete(null);
            } else {
                throw new Error("Failed to delete app");
            }
        } catch (error) {
            console.error("Error deleting app:", error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">应用管理</h2>
                    <p className="text-muted-foreground">管理您的应用程序列表和配置。</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            添加应用
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>添加新应用</DialogTitle>
                            <DialogDescription>
                                在这里添加新的应用程序信息。
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">应用名称</Label>
                                    <Input
                                        id="name"
                                        value={newApp.name}
                                        onChange={(e) =>
                                            setNewApp({ ...newApp, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="url">URL</Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        value={newApp.url}
                                        onChange={(e) =>
                                            setNewApp({ ...newApp, url: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">描述</Label>
                                    <Textarea
                                        id="description"
                                        value={newApp.description}
                                        onChange={(e) =>
                                            setNewApp({
                                                ...newApp,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">保存</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {apps.map((app) => (
                    <div
                        key={app.id}
                        className="relative group rounded-lg border p-4 hover:shadow-lg transition-shadow"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 transition-opacity"
                            onClick={() => setAppToDelete(app.id)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>

                        <h3 className="font-semibold mb-2">{app.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            {app.description}
                        </p>
                        <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                        >
                            {app.url}
                        </a>
                    </div>
                ))}
            </div>

            <AlertDialog
                open={!!appToDelete}
                onOpenChange={(open: boolean) => !open && setAppToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            您确定要删除这个应用吗？此操作无法撤销。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => appToDelete && handleDeleteApp(appToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
