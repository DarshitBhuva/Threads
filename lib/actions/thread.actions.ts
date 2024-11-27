"use server"
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import { ObjectId } from "mongodb";
import mongoose, { model } from "mongoose";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}

export async function createThread({ text, author, communityId, path }: Params) {

    try {
        await connectToDB();

        const createdThread = await Thread.create({
            text,
            author: new mongoose.Types.ObjectId(author),
            community: null,

        })

        // update user model
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        })

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to create Thread: ${error.message}`)
    }
}

export async function fetchPosts(pageNo = 1, pageSize = 20) {
    await connectToDB();

    // Calculate the number of posts to skip
    const skipAmount = (pageNo - 1) * pageSize;
    const posts = await Thread.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: 'desc' })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({ path: 'author', model: User })
        .populate({
            path: 'children',
            populate: {
                path: 'author',
                model: User,
                select: "_id name parentId image"
            }
        })

    const totalPostCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } });

    const isNext = totalPostCount > (skipAmount + posts.length);

    return { posts, isNext };
}

export async function fetchThreadById(id: string) {
    await connectToDB();

    try {
        // TODO : Populate community

        const thread = await Thread.findById(id)
            .populate({ path: 'author', model: User, select: "_id id name image" })
            .populate({
                path: 'children', model: Thread, populate: [
                    { path: 'author', model: User, select: "_id id name image parentId" },
                    { path: 'children', model: Thread, populate: { path: 'author', model: User, select: "_id id name parentId image" } }
                ]
            });

        return thread;

    } catch (error) {

    }
}

export async function addCommentToThread(threadId: string, commentText: string, userId: string, path: string) {

    try {
        await connectToDB();

        //adding comment
        const originalThread = await Thread.findById(threadId);

        if (!originalThread)
            throw new Error("Thread Not Found")


        // create a new thread with commented text
        const commentThread = await Thread.create({
            text: commentText,
            author: new mongoose.Types.ObjectId(userId),
            parentId: threadId,
        })

        // save comment-Thread reference to original thread
        originalThread.children.push(commentThread._id);
        await originalThread.save();

        revalidatePath(path);

    } catch (error) {

    }
}