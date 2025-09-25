"use client"

import { 
  Building2, 
  Users, 
  CreditCard, 
  Crown, 
  Activity, 
  Server, 
  Settings, 
  ShoppingCart, 
  Package, 
  BarChart3,
  LogOut,
  User
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

// Super Admin navigation items
const superAdminNavigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: Activity,
  },
  {
    name: "Companies",
    href: "/admin/companies",
    icon: Building2,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Subscriptions",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
  {
    name: "System",
    href: "/admin/system",
    icon: Server,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

// Client navigation items
const clientNavigation = [
  {
    name: "Dashboard",
    href: "/client/dashboard",
    icon: Activity,
  },
  {
    name: "Sales",
    href: "/client/sales",
    icon: ShoppingCart,
  },
  {
    name: "Inventory",
    href: "/client/inventory",
    icon: Package,
  },
  {
    name: "Staff",
    href: "/client/staff",
    icon: Users,
  },
  {
    name: "Reports",
    href: "/client/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/client/settings",
    icon: Settings,
  },
]

export function AppSidebar({ userType = "client", user = null, company = null }) {
  const pathname = usePathname()
  
  // Determine which navigation to use
  const navigation = userType === "super_admin" ? superAdminNavigation : clientNavigation
  
  // Determine branding
  const isAdmin = userType === "super_admin"
  const brandName = isAdmin ? "Admin Portal" : (company?.name || "Business")
  const brandIcon = isAdmin ? Crown : Building2

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('userType')
    localStorage.removeItem('companyData')
    localStorage.removeItem('subscriptionData')
    window.location.href = '/login'
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return isAdmin ? 'SA' : 'U'
  }

  return (
    <Sidebar>
      {/* Sidebar Header */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className={`w-8 h-8 ${isAdmin ? 'bg-purple-600' : 'bg-blue-600'} rounded-lg flex items-center justify-center`}>
            {brandIcon && <brandIcon className="h-5 w-5 text-white" />}
          </div>
          <span className="font-semibold text-lg truncate">{brandName}</span>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.name || (isAdmin ? 'Super Admin' : 'User')}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 px-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}