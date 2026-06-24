import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "360 Pathshala — Modern Student Management System" },
      { name: "description", content: "A 360° Student Management System for schools and colleges. Streamline attendance, grades, results, and parent–teacher communication in one modular platform." },
      { name: "author", content: "360 Pathshala" },
      { property: "og:title", content: "360 Pathshala — Modern Student Management System" },
      { property: "og:description", content: "A 360° Student Management System for schools and colleges. Streamline attendance, grades, results, and parent–teacher communication in one modular platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "360 Pathshala — Modern Student Management System" },
      { name: "twitter:description", content: "A 360° Student Management System for schools and colleges. Streamline attendance, grades, results, and parent–teacher communication in one modular platform." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/672a91e9-9d75-4171-8a80-409d94d668a9/id-preview-1b700b70--f636f150-3cd0-4c97-88dd-6ef24471f6ad.lovable.app-1776762331831.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/672a91e9-9d75-4171-8a80-409d94d668a9/id-preview-1b700b70--f636f150-3cd0-4c97-88dd-6ef24471f6ad.lovable.app-1776762331831.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700;800&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
