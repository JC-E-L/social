"use server"

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action"
import { revalidatePath } from "next/cache";


export async function createPost(content:string, image:string){
    try {
        const userId = await getDbUserId();//gives the user id

        if(!userId) return; 

        const post = await prisma.post.create({
            data:{
                content,
                image,
                authorId: userId,
            }
        })  

        revalidatePath("/");//purge the cache from the home page
        return {success: true, post}
    } catch (error) {
        console.log("Failed to create Post", error);
        return {success: false, error: "Failed to create Post"};
    }
}

export async function getPosts(){
    try {
        const posts = await prisma.post.findMany({
            orderBy:{
                createdAt:"desc"
            },
            include:{
                author: {
                    select:{
                        image:true,
                        name:true,
                        username:true
                    }
                },
                comments:{
                    include:{
                        author:{
                            select:{
                                id:true,
                                username:true,
                                name:true,
                                image:true
                            }
                        }
                    },
                    orderBy:{
                        createdAt:"asc"
                    }
                },
                likes:{
                    select:{
                        userId:true
                    }
                },
                _count:{
                    select:{
                        likes:true,
                        comments:true
                    }
                }
            }
        });
        return posts
    } catch (error) {
        console.log("Error in getPosts",error);
        throw new Error("Failed to fetch posts");
    }
}

export async function toggleLike(postId: string){
    try {
        const userId = await getDbUserId();
        if(!userId) return

        const existingLike = await prisma.like.findUnique({
            where:{
                userId_postId:{
                    userId,
                    postId,
                },
            },
        });

        const post = await prisma.post.findUnique({
            where:{
                id: postId
            },
            select:{
                authorId: true
            },
        });

        if(!post) throw new Error("Post not found");

        if(existingLike){
            await prisma.like.delete({
                where:{
                    userId_postId:{
                        userId,
                        postId
                    },
                },
            });
        }else{
            //like and create notification (only if liking someone else's post)
            await prisma.$transaction([
                prisma.like.create({
                    data:{
                        userId,
                        postId,
                    },
                }),
            
            ...(post.authorId !== userId
                ? [
                    prisma.notification.create({
                        data:{
                            type: "LIKE",
                            userId: post.authorId,//recipient (post author)
                            creatorId: userId, // person who liked
                            postId,
                            },
                        }),
                    ]
                : []),
            ]);
        }

        revalidatePath("/");
        return {success: true};
    } catch (error) {
        console.error("Failed to toggle like",error);
        return{success: false, error:"Failed to toggle like"};
    }
}

export async function createComment(postId: string, content: string){
    try {
        const userId = await getDbUserId();

        if(!userId) return;
        if(!content) throw new Error("Content is required");

        const post = await prisma.post.findUnique({
            where:{id:postId},
            select:{authorId: true},
        });

        if(!post) throw new Error("Post not found!");

        //create comment and notification in a transaction
        const [comment] = await prisma.$transaction(async(tx)=>{
            //create comment first
            const newComment = await tx.comment.create({
                data:{
                    content,
                    authorId: userId,
                    postId,
                },
            });
            
            //create notification if commenting on someone elses' post
            if(post.authorId !== userId){
                await tx.notification.create({
                    data:{
                        type:"COMMENT",
                        userId: post.authorId,
                        creatorId: userId,
                        postId,
                        commentId: newComment.id,
                    },
                });
            }

            return [newComment];
        });

        revalidatePath(`/post/${postId}`);
        return{success: true, comment};
    } catch (error) {
        console.error("Failed to create comment", error);
        return {success: false, error:"Failed to create comment"};
    }
}

export async function deletePost(postId: string){
    try {
        //check user id
        const userId = await getDbUserId();
        //check if post exists
        const post = await prisma.post.findUnique({
            where:{id: postId},
            select:{authorId: true},
        });

        //if post does not exist
        if(!post) throw new Error("Post not found");
        //if user is not the owner of the post therefore no delete permission
        if(post.authorId !== userId) throw new Error("Unauthorize - no delete permission");
        //get the post id to delete
        await prisma.post.delete({
            where:{id:postId},
        });

        revalidatePath("/"); //pruge the cache
        return {success: true};
    } catch (error) {
        console.error("Failed to delete the post");
        return {success: false, error:"Failed to delete the post"};
    }
}