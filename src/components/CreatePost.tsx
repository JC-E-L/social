"use client"
import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react'
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { ImageIcon, Loader2Icon, SendIcon } from 'lucide-react';
import { createPost } from '@/actions/post.action';
import toast from 'react-hot-toast';

export default function CreatePost() {
    
    const { user } = useUser();
    const [content, setContent] = useState("");//for content
    const [imageUrl, setImageUrl] = useState("");//for photos
    const [isPosting, setIsPosting] = useState(false);//for loading effect
    const [showImageUpload, setShowImageUpload] = useState(false);//dropzone for photos or images.

    const handleSubmit = async () => {
        if(!content.trim() && !imageUrl) return

        setIsPosting(true);
        try {
          const result = await createPost(content, imageUrl);
          if(result.success){
            //If success the form will be clear
            setContent("");
            setImageUrl("");
            setShowImageUpload(false);

            toast.success("Post created successfully");
          }
        } catch (error) {
            console.log("Failed to create Post", error);
            toast.error("failed to create post");
        } finally{
            setIsPosting(false);
        }
    }
  return (
    <Card className="mb-6">
        <CardContent className="pt-6">
            <div className="flex space-y-4">
            <Avatar className="w-20 h-20 border-2 ">
                {/* user image */}
                <AvatarImage src={user?.imageUrl || "/avatar.png"} />  
            </Avatar>
                <Textarea 
                placeholder="What's on your mind?"
                className="ml-3 min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPosting}
                />
            </div>

            {/* TODO: Handle image uploads */}

            <div className="flex items-center justify-between border-t pt-4">
                <div className="flex space-x-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => setShowImageUpload(!showImageUpload)}
                        disabled={isPosting}
                    >
                        <ImageIcon className="size-4 mr-2"/>
                        Photo
                    </Button>
                </div>
                <Button
                    className="flex items-center"
                    onClick={handleSubmit}
                    disabled={(!content.trim() && !imageUrl) || isPosting}//disabled if there is no content, image or isposting state
                >
                    {isPosting ? (
                        <>
                            <Loader2Icon className="size-4 mr-2 animate-spin"/>
                            Posting...
                        </>
                    ):(
                        <>
                            <SendIcon className='size-4 mr-2'/>
                            Post
                        </>
                    )
                    }
                    
                </Button>
            </div>
        </CardContent>
    </Card>
  )
}
