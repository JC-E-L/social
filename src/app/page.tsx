import ModeToggler from "@/components/ModeToggler";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div className="m-4 flex">
          <SignedOut>
            <SignInButton mode="modal">
              
              <Button>
                Sign in
              </Button>
            </SignInButton>  
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>

        <Button variant="secondary">Click me</Button>
        <ModeToggler/>
    </div>
  );
}
