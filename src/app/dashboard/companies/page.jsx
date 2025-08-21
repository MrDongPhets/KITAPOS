// app/dashboard/companies/page.jsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Building2 } from "lucide-react"

const companiesData = [
  {
    id: 1,
    name: "BAKERY",
    email: "salvet23@gmail.com",
    phone: "0456888615",
    plan: "Plan trial",
    users: "1 users",
    created: "Created 8/17/2025",
    status: "active",
  },
  {
    id: 2,
    name: "TEST",
    email: "testchristinnew@gmail.com",
    phone: "0456888615",
    plan: "Plan trial",
    users: "1 users",
    created: "Created 8/16/2025",
    status: "suspended",
  },
  {
    id: 3,
    name: "Test Restaurant",
    email: "test@company.com",
    phone: "+639123456789",
    plan: "Plan trial",
    users: "1 users",
    created: "Created 8/16/2025",
    status: "suspended",
  },
]

const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "suspended":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

const getFilteredCompanies = (companies, filter) => {
  if (filter === "all") return companies
  return companies.filter((company) => company.status === filter)
}

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredCompanies = getFilteredCompanies(companiesData, activeTab).filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTabCounts = () => {
    return {
      all: companiesData.length,
      pending: companiesData.filter((c) => c.status === "pending").length,
      active: companiesData.filter((c) => c.status === "active").length,
      suspended: companiesData.filter((c) => c.status === "suspended").length,
    }
  }

  const tabCounts = getTabCounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">Manage company registrations and approvals</p>
        </div>
        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search companies by name or email..."
          className="pl-10 max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="all" className="data-[state=active]:bg-gray-100">
            All Companies
            {tabCounts.all > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                {tabCounts.all}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-gray-100">
            Pending
            {tabCounts.pending > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                {tabCounts.pending}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-gray-100">
            Active
            {tabCounts.active > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                {tabCounts.active}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="suspended" className="data-[state=active]:bg-gray-100">
            Suspended
            {tabCounts.suspended > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                {tabCounts.suspended}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 bg-blue-100">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Building2 className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{company.name}</h3>
                    <p className="text-gray-600 text-sm">{company.email}</p>
                    <p className="text-gray-500 text-sm">{company.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <span>{company.plan}</span>
                      <span>•</span>
                      <span>{company.users}</span>
                      <span>•</span>
                      <span>{company.created}</span>
                    </div>
                    <Badge
                      className={`capitalize ${getStatusColor(company.status)}`}
                      variant="secondary"
                    >
                      {company.status}
                    </Badge>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Company</DropdownMenuItem>
                      <DropdownMenuItem>Manage Users</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Suspend Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}

          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No companies found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Get started by adding your first company."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}