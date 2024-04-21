"use client";
import React, { useEffect } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import dynamic from "next/dynamic";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { UserPostRetType } from "@/app/(auth)/api/user/route";
import { Rocket, History } from "lucide-react";
import Link from "next/link";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const columns: ColumnDef<UserPostRetType>[] = [
    {
        header: "Title",
        accessorKey: "title"
    },
    {
        header: "Create Time",
        accessorKey: "create_time"
    },
    {
        header: "Update Time",
        accessorKey: "update_time"
    },
    {
        header: "Published Version",
        accessorKey: "published_version"
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const post = row.original;
            return (
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Edit</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mr-2">
                        {
                            // 0..3循环
                            Array.from({
                                length: 3 < post.published_version ? 3 : post.published_version
                            }).map((_, index) => (
                                <Link
                                    key={index}
                                    href={`/dashboard/post-edit/${post.id}/${post.published_version - index}`}
                                >
                                    <DropdownMenuItem>
                                        {index == 0 ? (
                                            <Rocket className="mr-2 h-4 w-4" />
                                        ) : (
                                            <History className="mr-2 h-4 w-4" />
                                        )}
                                        <span>Version: {post.published_version - index}</span>
                                    </DropdownMenuItem>
                                </Link>
                            ))
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }
    }
];

enum PageState {
    Loding,
    Done
}

export default function PostEdit() {
    const [pageState, setPageState] = React.useState(PageState.Loding);
    const [data, setData] = React.useState<UserPostRetType[]>([]);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    });
    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            setPageState(PageState.Done);
        }
        const getData = async () => {
            const data = await fetch(`/api/user`);
            setData(await data.json());
            setPageState(PageState.Done);
        };
        getData();
    }, []);

    if (pageState === PageState.Loding) {
        return <div>Loading...</div>;
    }

    return (
        <div className="h-full w-full p-2">
            <div className="h-full w-full overflow-auto border rounded-md">
                <Table className="max-h-full bg-white border-b">
                    <TableHeader className="top-0 sticky bg-secondary">
                        {table.getHeaderGroups().map((headerGroup, index) => (
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
                                        <>
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        </>
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
