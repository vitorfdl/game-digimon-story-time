import { Suspense } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Users, Github, History } from 'lucide-react'
import {
  SidebarProvider,
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
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useRepoUpdate } from '@/hooks/use-repo-update'
import NavbarSearch from '@/components/navigation/NavbarSearch'
import { Skeleton } from '@/components/ui/skeleton'

// Helper function to get page title based on current route
function getPageTitle(pathname: string): string {
  if (pathname === '/' || pathname.startsWith('/digimon')) {
    return 'Digimons'
  }
  return 'Digimon Time Stranger'
}

export default function AppLayout() {
  const location = useLocation()
  const repo = useRepoUpdate()
  const faviconUrl = `${import.meta.env.BASE_URL}favicon/favicon.svg`
  const digimonActive = location.pathname === '/' || location.pathname.startsWith('/digimon')
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex aspect-square size-7 items-center justify-center">
              <img src={faviconUrl} alt="Digimon Time Stranger" className="size-7" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Digimon Time Stranger</span>
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
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground/80">{getPageTitle(location.pathname)}</span>
            <h1 className="text-lg font-semibold leading-tight text-foreground">Digimon Time Stranger Compendium</h1>
          </div>
          <Suspense
            fallback={
              <Skeleton className="h-11 w-full max-w-xl rounded-full" />
            }
          >
            <NavbarSearch />
          </Suspense>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://github.com/vitorfdl/digimon-time-stranger"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Badge variant="outline" className="gap-1.5">
                  <span className="relative mr-1 inline-flex size-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/40 animate-ping" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <History className="size-3 opacity-80" />
                  <span className="hidden sm:inline">{repo.loading ? 'Fetching latest update…' : repo.relativeLabel ? `Updated ${repo.relativeLabel}` : 'Update unavailable'}</span>
                  <span className="sm:hidden">{repo.loading ? '…' : repo.relativeLabel ?? '—'}</span>
                </Badge>
              </a>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              {repo.error ? (
                <span>Update unavailable: {repo.error}</span>
              ) : repo.isoTimestamp ? (
                <span>Last pushed at {new Date(repo.isoTimestamp).toLocaleString()}</span>
              ) : (
                <span>Fetching latest update…</span>
              )}
            </TooltipContent>
          </Tooltip>
        </header>
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}


