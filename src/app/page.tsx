import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div className="justify-center items-center">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-red-500 p-3 rounded-lg" >
                  Sign in
              </button>
            </SignInButton>  
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
      
    </div>
  );
}
