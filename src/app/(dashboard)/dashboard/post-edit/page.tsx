"use client";
import React, { useEffect } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { PostActionButtons } from "./PostActionButton";
import { format } from "date-fns";
import { UserPostRetType } from "@/app/(auth)/api/user/route";

export default function PostEdit() {
    const [data, setData] = React.useState<UserPostRetType[]>([]);
    const handleChange = (postId: number, version: number, action: "delete" | "check_out") => {
        // 创建data的拷贝
        const newData = [...data];
        switch (action) {
            case "delete":
                for (let i = 0; i < newData.length; i++) {
                    if (newData[i].id === postId) {
                        newData[i].postVersions = newData[i].postVersions.filter(
                            (v) => v.version !== version
                        );
                        if (newData[i].postVersions.length === 0) {
                            newData.splice(i, 1);
                            i--;
                        } else if (newData[i].current_version == version) {
                            // 找到最大的版本，设置为发布
                            const maxVersion = Math.max(
                                ...newData[i].postVersions.map((v) => v.version)
                            );
                            newData[i].current_version = maxVersion;
                        }
                        break;
                    }
                }
                break;
            case "check_out":
                for (let i = 0; i < newData.length; i++) {
                    if (newData[i].id === postId) {
                        newData[i].current_version = version;
                        break;
                    }
                }
        }
        setData(newData as UserPostRetType[]);
    };
    const columns: ColumnDef<UserPostRetType>[] = [
        {
            header: "Title",
            accessorFn: (row) => row.currentVersion?.title ?? row.postVersions[0].title
        },
        {
            header: "Create Time",
            accessorFn: (row) => format(row.create_time, "LLLL d, yyyy, p")
        },
        {
            header: "Update Time",
            accessorFn: (row) =>
                row.currentVersion
                    ? format(row.currentVersion.update_time, "LLLL d, yyyy, p")
                    : "no version"
        },
        {
            header: "Published Version",
            accessorFn: (row) => row.currentVersion?.version ?? "no version"
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const post = row.original;
                return (
                    <PostActionButtons post={post} handleChange={handleChange}></PostActionButtons>
                );
            }
        }
    ];
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    });
    const session = useSession({
        required: true
    });

    useEffect(() => {
        if (session.status !== "authenticated") return;
        const getData = async () => {
            const data = await fetch(`/api/user/${session.data.user?.name}`);
            setData(await data.json());
        };
        getData();
    }, [session.status]);

    return (
        <div className="h-full w-full p-2">
            <div className="h-full w-full overflow-auto border rounded-md">
                <Table className="max-h-full bg-white border-b">
                    <TableHeader className="top-0 sticky bg-secondary">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
PostEdit.auth = true;
