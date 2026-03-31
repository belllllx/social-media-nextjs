import Link from "next/link";
import { Home, Search, Users, ArrowLeft } from "lucide-react";
import { Button } from "@chakra-ui/react";

export function Error404() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-2xl mx-auto">
          {/* Large 404 Display */}
          <div className="relative mb-8">
            <h1 className="text-[180px] md:text-[240px] font-bold leading-none tracking-tighter text-foreground/5 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
                  Page Not Found
                </h2>
                <p className="text-muted-foreground text-base md:text-lg">
                  Looks like this page went offline
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm md:text-base mb-8 max-w-md mx-auto text-pretty">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            Let&apos;s get you back to connecting with friends.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Button asChild size="lg" className="gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                Go to Feed
              </Link>
            </Button>
            <Button asChild size="lg" className="gap-2">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}