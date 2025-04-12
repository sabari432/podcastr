"use client";

import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";

const LeftSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { audio } = useAudio();

  return (
    <section
      className={cn("left_sidebar h-[calc(100vh-5px)]", {
        "h-[calc(100vh-140px)]": audio?.audioUrl,
      })}
    >
      <nav className="flex flex-col gap-6">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-1 pb-10 max-lg:justify-center"
        >
          <div className="flex items-center gap-2">
            <Image src="/icons/logo.svg" alt="logo" width={30} height={30} />
            <h1 className="text-24 font-extrabold text-orange-1 tracking-wide border-l-4 border-orange-1 pl-3">
              Podcraft
            </h1>
          </div>
        </Link>

        {sidebarLinks.map(({ route, label, imgURL }) => {
          const isActive =
            pathname === route || pathname.startsWith(`${route}/`);

          return label === "Create Podcast" ? (
            <SignedIn key={label}>
              <Link
                href={route}
                className={cn(
                  "flex gap-3 items-center font-extrabold text-orange-1 py-4 max-lg:px-4 justify-center lg:justify-start",
                  {
                    "bg-nav-focus border-r-4 text-white-1 border-orange-1": isActive,
                  }
                )}
              >
                <Image src={imgURL} alt={label} width={24} height={24} />
                <p>{label}</p>
              </Link>
            </SignedIn>
          ) : (
            <Link
              href={route}
              key={label}
              className={cn(
                "flex gap-3 font-extrabold text-orange-1 items-center py-4 max-lg:px-4 justify-center lg:justify-start",
                {
                  "bg-nav-focus border-r-4 text-white-1 border-orange-1": isActive,
                }
              )}
            >
              <Image src={imgURL} alt={label} width={24} height={24} />
              <p>{label}</p>
            </Link>
          );
        })}
      </nav>

      <SignedOut>
        <div className="flex-center w-full pb-14 max-lg:px-4 lg:pr-8">
          <Button asChild className="text-16 w-full bg-orange-1 font-extrabold">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex-center w-full pb-14 max-lg:px-4 lg:pr-8">
          <Button
            className="text-16 w-full bg-orange-1 font-extrabold"
            onClick={() => signOut(() => router.push("/"))}
          >
            Log Out
          </Button>
        </div>
      </SignedIn>
    </section>
  );
};

export default LeftSidebar;
