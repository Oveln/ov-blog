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
import { useSession } from "next-auth/react";
import { UserPostRetType } from "@/app/(auth)/api/user/route";
import { PostActionButton } from "./PostActionButton";
import { Loading } from "@/components/ui/loading";
import { useRouter } from "next/navigation";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const columns: ColumnDef<UserPostRetType>[] = [
    {
        header: "Title",
        accessorFn: (row) => row.postVersions.find((v) => v.published)?.title
    },
    {
        header: "Create Time",
        accessorFn: (row) => row.postVersions.find((v) => v.published)?.create_time.toLocaleString()
    },
    {
        header: "Update Time",
        accessorFn: (row) => row.postVersions.find((v) => v.published)?.update_time.toLocaleString()
    },
    {
        header: "Published Version",
        accessorKey: "published_version"
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const post = row.original;
            console.log(post);
            return <PostActionButton post={post}></PostActionButton>;
        }
    }
];

export default function PostEdit() {
    const [data, setData] = React.useState<UserPostRetType[]>([]);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    });
    const { data: session } = useSession();
    if (!session) {
        useRouter().push("/login");
    }

    useEffect(() => {
        const getData = async () => {
            const data = await fetch(`/api/user`);
            setData(await data.json());
        };
        getData();
    }, []);

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
