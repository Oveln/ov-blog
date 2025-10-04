import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import "cherry-markdown/dist/cherry-markdown.css";
import Cherry from "cherry-markdown/dist/cherry-markdown.core";
import { toast } from "sonner";
import { uploadFile } from "@/lib/upload";

export interface MarkdownEditorProps {
    initialContent: string;
}

export interface MarkdownEditorRef {
    getValue: () => string;
    setValue: (val: string) => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(
    ({ initialContent }, ref) => {
        const cherryRef = useRef<HTMLDivElement | null>(null);
        const cherryInstanceRef = useRef<Cherry | null>(null);

        useImperativeHandle(ref, () => ({
            getValue: () => cherryInstanceRef.current?.getValue() ?? "",
            setValue: (val: string) => cherryInstanceRef.current?.setValue(val),
        }));

        useEffect(() => {
            let isMounted = true;
            const initCherry = async () => {
                if (!cherryRef.current || cherryInstanceRef.current) return;
                const CherryModule = await import("cherry-markdown/dist/cherry-markdown");
                if (!isMounted || !cherryRef.current) return;
                const instance = new CherryModule.default({
                    el: cherryRef.current,
                    value: initialContent,
                    fileUpload: async (file: File, callback: (url: string) => void) => {
                        const result = await uploadFile(file, {
                            onSuccess: (data) => {
                                if (data) {
                                    callback(data.url);
                                    toast("文件上传成功", { duration: 3000 });
                                }
                            },
                            onError: (error) => {
                                toast("文件上传失败", {
                                    description: error,
                                    duration: 5000,
                                });
                            },
                        });
                        if (result.status === "error" && !result.message) {
                            toast("文件上传失败", {
                                description: "请检查网络连接",
                                duration: 5000,
                            });
                        }
                    },
                });
                cherryInstanceRef.current = instance;
            };
            initCherry();
            return () => {
                isMounted = false;
                if (cherryRef.current) cherryRef.current.innerHTML = "";
                cherryInstanceRef.current = null;
            };
        }, [initialContent]);

        return <div ref={cherryRef} className="editor h-full" id="markdown-container" />;
    }
);

MarkdownEditor.displayName = "MarkdownEditor";
export default MarkdownEditor;
