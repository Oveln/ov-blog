"use client";

import { trpc } from "@/lib/trpc";
import React from "react";

export function TestCurrentUser() {
    const {
        data: currentUser,
        isLoading: userLoading,
        error: userError,
    } = trpc.user.getCurrentUser.useQuery();
    const {
        data: username,
        isLoading: nameLoading,
        error: nameError,
    } = trpc.user.getUsername.useQuery();

    if (userLoading || nameLoading) return <div>Loading user info...</div>;
    if (userError) return <div>Error getting user: {userError.message}</div>;
    if (nameError) return <div>Error getting username: {nameError.message}</div>;

    // 确保数据已加载
    if (!currentUser) return <div>No user data available</div>;

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Current User Info</h2>

            <div className="space-y-2">
                <div>
                    <span className="font-medium">User ID:</span>{" "}
                    {currentUser.id ?? "No ID"}
                </div>
                <div>
                    <span className="font-medium">Name:</span>{" "}
                    {currentUser.name ?? "Not set"}
                </div>
                <div>
                    <span className="font-medium">Email:</span>{" "}
                    {currentUser.email ?? "No email"}
                </div>
                <div>
                    <span className="font-medium">Role:</span>
                    <span
                        className={`ml-2 px-2 py-1 rounded text-sm ${
                            currentUser.role === "ADMIN"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                        }`}
                    >
                        {currentUser.role}
                    </span>
                </div>
                {currentUser.image && (
                    <div>
                        <span className="font-medium">Avatar:</span>
                        <img
                            src={currentUser.image}
                            alt="User avatar"
                            className="ml-2 w-8 h-8 rounded-full inline-block"
                        />
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium mb-2">Username (from separate endpoint):</h3>
                {username ? (
                    <div className="text-lg font-semibold text-blue-600">
                        {username.username}
                    </div>
                ) : (
                    <div className="text-gray-500 italic">No username available</div>
                )}
            </div>
        </div>
    );
}
