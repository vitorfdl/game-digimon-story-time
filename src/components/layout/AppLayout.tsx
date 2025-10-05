import { Github, History, Swords, Users } from "lucide-react";
import { Suspense } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import NavbarSearch from "@/components/navigation/NavbarSearch";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to get page title based on current route
function getPageTitle(pathname: string): string {
	if (pathname === "/" || pathname.startsWith("/digimon")) {
		return "Digimons";
	}
	if (pathname.startsWith("/team-builder")) {
		return "Team Builder";
	}
	return "Digimon Time Stranger";
}

export default function AppLayout() {
	const location = useLocation();
	const faviconUrl = `${import.meta.env.BASE_URL}favicon/favicon.svg`;
	const digimonActive =
		location.pathname === "/" || location.pathname.startsWith("/digimon");
	const teamBuilderActive = location.pathname.startsWith("/team-builder");
	return (
		<SidebarProvider>
			<Sidebar collapsible="icon">
				<SidebarHeader>
					<div className="flex items-center gap-2 px-2 py-1.5">
						<div className="flex aspect-square size-7 items-center justify-center">
							<img
								src={faviconUrl}
								alt="Digimon Time Stranger"
								className="size-7"
							/>
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">
								Digimon Time Stranger
							</span>
							<span className="truncate text-xs">Reference Sheets</span>
						</div>
					</div>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Navigate</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton asChild isActive={digimonActive}>
										<NavLink to="/">
											<Users />
											<span>Digimons</span>
										</NavLink>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton asChild isActive={teamBuilderActive}>
										<NavLink to="/team-builder">
											<Swords />
											<span>Team Builder</span>
										</NavLink>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<a
									href="https://github.com/vitorfdl/digimon-time-stranger"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Github />
									<span>Contribute on GitHub</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
			<SidebarInset>
				<header className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
					<SidebarTrigger className="-ml-1" />
					<div className="h-10 w-px bg-border/70" />
					<div className="flex flex-1 flex-col justify-center">
						<span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground/80">
							{getPageTitle(location.pathname)}
						</span>
					</div>
					<Suspense
						fallback={
							<Skeleton className="h-11 w-full max-w-xl rounded-full" />
						}
					>
						<NavbarSearch />
					</Suspense>
				</header>
				<main className="flex-1 p-4">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
