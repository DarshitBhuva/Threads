"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface Params {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string
}

export async function updateUser({ userId, username, name, bio, image, path }: Params): Promise<void> {

    try {

        await connectToDB();

        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true
            },
            { upsert: true }
        );

        if (path === "/profile/edit") {
            revalidatePath(path);
        }

    } catch (error: any) {
        throw new Error(`Failed to update/create user: ${error.message}`)
    }

}

export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User.findOne({ id: userId })
    } catch (error: any) {
        throw new Error(`Failed to ferch user: ${error.message}`)
    }
}

export async function fetchUserThreads(userId: string) {
    try {
        await connectToDB();

        // TODO: Populate Community
        // find all threads authored by user with given userId
        const threads = await User.findOne({ id: userId })
            .populate({
                path: "threads", model: Thread, populate: {
                    path: "children",
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: "name image id"
                    }
                }
            })

        return threads;
    } catch (error: any) {
        throw new Error(`Failed to ferch user Threads: ${error.message}`)
    }
}

export async function fetchUsers({
    userId,
    searchString = "",
    pageNo = 1,
    pageSize = 20,
    sortBy = "desc"
}: { userId: string, searchString?: string, pageNo?: number, pageSize?: number, sortBy?: SortOrder }) {
    try {
        await connectToDB();
        const skipAmount = (pageNo - 1) * pageSize;
        const regex = new RegExp(searchString, "i");

        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }
        }

        if (searchString.trim() !== '') {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ]
        }

        const sortOptions = { createdAt: sortBy };
        const users = await User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize);
        const totalUsersCount = await User.countDocuments(query);

        const isNext = totalUsersCount > (skipAmount + users.length);
        return { users, isNext };

    } catch (error: any) {
        throw new Error(`Failed to ferch users: ${error.message}`)
    }
}

export async function getActivity(userId: string) {
    try {
        await connectToDB();

        // find all threads created by user
        const userThreads = await Thread.find({ author: userId });

        // collect all the child thread ids from children field
        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children)
        }, [])

        const replies = await Thread.find({
            _id: { $in: childThreadIds },
            author: { $eq: userId }
        }).populate({
            path : 'author',
            model : User, 
            select : "name image _id"
        })

        return replies;

    } catch (error: any) {
        throw new Error(`Failed to ferch Activities: ${error.message}`)
    }
}