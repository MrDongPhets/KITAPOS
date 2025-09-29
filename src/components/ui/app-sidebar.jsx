
"use client"

import { useState } from "react"
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
  User,
  Layers,
  Tag,
  ChevronDown,
  ChevronRight
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

// Client navigation items with Inventory submenu
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
    icon: Package,
    subItems: [
      {
        name: "Products",
        href: "/client/inventory/products",
        icon: Package,
      },
      {
        name: "Categories", 
        href: "/client/inventory/categories",
        icon: Tag,
      },
      {
        name: "Stock Movement",
        href: "/client/inventory/movements",
        icon: Layers,
      }
    ]
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
  const [inventoryExpanded, setInventoryExpanded] = useState(pathname.startsWith('/client/inventory'))
  
  // Determine which navigation to use
  const navigation = userType === "super_admin" ? superAdminNavigation : clientNavigation
  
  // Determine branding
  const isAdmin = userType === "super_admin"
  const brandName = isAdmin ? "Admin Portal" : (company?.name || "Business")
  const BrandIcon = isAdmin ? Crown : Building2  // Use PascalCase for component

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
            <BrandIcon className="h-5 w-5 text-white" />
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
                // Handle items with submenus (like Inventory)
                if (item.subItems) {
                  const isInventoryActive = pathname.startsWith('/client/inventory')
                  
                  return (
                    <div key={item.name}>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          onClick={() => setInventoryExpanded(!inventoryExpanded)}
                          isActive={isInventoryActive}
                          className="cursor-pointer"
                        >
                          <item.icon />
                          <span>{item.name}</span>
                          {inventoryExpanded ? (
                            <ChevronDown className="ml-auto h-4 w-4" />
                          ) : (
                            <ChevronRight className="ml-auto h-4 w-4" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      
                      {/* Sub-items for Inventory */}
                      {inventoryExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.subItems.map((subItem) => {
                            const isSubItemActive = pathname === subItem.href
                            return (
                              <SidebarMenuItem key={subItem.name}>
                                <SidebarMenuButton asChild isActive={isSubItemActive} size="sm">
                                  <Link href={subItem.href} className="text-sm">
                                    <subItem.icon className="h-4 w-4" />
                                    <span>{subItem.name}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                }
                
                // Regular menu items
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