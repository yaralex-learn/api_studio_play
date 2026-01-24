"use client"

import { useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Search } from "lucide-react"
import { subscribersData } from "@/lib/market-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"

type Subscriber = {
  id: number
  name: string
  email: string
  tier: string
  registrationDate: string
  channel: string
}

export function SubscribersTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [selectedUser, setSelectedUser] = useState<Subscriber | null>(null)

  const columns: ColumnDef<Subscriber>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "tier",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Subscription Tier
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const tier = row.getValue("tier") as string
        return (
          <div className="flex items-center">
            <span
              className={`mr-2 h-2 w-2 rounded-full ${
                tier === "Premium" ? "bg-green-500" : tier === "Basic" ? "bg-blue-500" : "bg-gray-500"
              }`}
            />
            {tier}
          </div>
        )
      },
    },
    {
      accessorKey: "registrationDate",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Registration Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{formatDate(row.getValue("registrationDate"))}</div>,
    },
    {
      accessorKey: "channel",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Channel
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("channel")}</div>,
    },
  ]

  const table = useReactTable({
    data: subscribersData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscribers</CardTitle>
        <CardDescription>Manage and view all your subscribers in one place</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedUser ? (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">User Profile</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                Back to List
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="font-medium w-32">Name:</span>
                      <span>{selectedUser.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-32">Email:</span>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-32">Subscription:</span>
                      <div className="flex items-center">
                        <span
                          className={`mr-2 h-2 w-2 rounded-full ${
                            selectedUser.tier === "Premium"
                              ? "bg-green-500"
                              : selectedUser.tier === "Basic"
                                ? "bg-blue-500"
                                : "bg-gray-500"
                          }`}
                        />
                        {selectedUser.tier}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-32">Registered:</span>
                      <span>{formatDate(selectedUser.registrationDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-32">Channel:</span>
                      <span>{selectedUser.channel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="text-base">Subscription History</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUser.tier !== "Free" ? (
                    <div className="overflow-hidden rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Channel</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Coupon</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Current subscription */}
                          <TableRow>
                            <TableCell className="font-medium">{selectedUser.channel}</TableCell>
                            <TableCell>{formatDate(selectedUser.registrationDate)} - Present</TableCell>
                            <TableCell>
                              <span className="text-amber-500 font-medium">PREMIUM25</span>
                            </TableCell>
                            <TableCell>$99.99</TableCell>
                            <TableCell>
                              <span className="text-green-500 font-medium">Active</span>
                            </TableCell>
                          </TableRow>

                          {/* Subscription update */}
                          <TableRow>
                            <TableCell className="font-medium">{selectedUser.channel}</TableCell>
                            <TableCell>
                              {formatDate(
                                new Date(
                                  new Date(selectedUser.registrationDate).setMonth(
                                    new Date(selectedUser.registrationDate).getMonth() - 1,
                                  ),
                                ).toISOString(),
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-amber-500 font-medium">ANNUAL20</span>
                            </TableCell>
                            <TableCell>$199.99</TableCell>
                            <TableCell>
                              <span className="text-muted-foreground text-xs">Annual billing</span>
                            </TableCell>
                          </TableRow>

                          {/* Previous subscriptions for Premium users */}
                          {selectedUser.tier === "Premium" && (
                            <>
                              <TableRow>
                                <TableCell className="font-medium">{selectedUser.channel}</TableCell>
                                <TableCell>
                                  {formatDate(
                                    new Date(
                                      new Date(selectedUser.registrationDate).setMonth(
                                        new Date(selectedUser.registrationDate).getMonth() - 3,
                                      ),
                                    ).toISOString(),
                                  )}{" "}
                                  -{" "}
                                  {formatDate(
                                    new Date(
                                      new Date(selectedUser.registrationDate).setDate(
                                        new Date(selectedUser.registrationDate).getDate() - 1,
                                      ),
                                    ).toISOString(),
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="text-amber-500 font-medium">BASIC15</span>
                                </TableCell>
                                <TableCell>$49.99</TableCell>
                                <TableCell>
                                  <span className="text-muted-foreground text-xs">15% discount</span>
                                </TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell className="font-medium">{selectedUser.channel}</TableCell>
                                <TableCell>
                                  {formatDate(
                                    new Date(
                                      new Date(selectedUser.registrationDate).setMonth(
                                        new Date(selectedUser.registrationDate).getMonth() - 4,
                                      ),
                                    ).toISOString(),
                                  )}{" "}
                                  -{" "}
                                  {formatDate(
                                    new Date(
                                      new Date(selectedUser.registrationDate).setMonth(
                                        new Date(selectedUser.registrationDate).getMonth() - 3,
                                      ),
                                    ).toISOString(),
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="text-amber-500 font-medium">TRIAL30</span>
                                </TableCell>
                                <TableCell>$0.00</TableCell>
                                <TableCell>
                                  <span className="text-muted-foreground text-xs">30-day free</span>
                                </TableCell>
                              </TableRow>

                              {/* Additional subscription history rows */}
                              <TableRow>
                                <TableCell className="font-medium">Web</TableCell>
                                <TableCell>
                                  {formatDate(
                                    new Date(
                                      new Date(selectedUser.registrationDate).setMonth(
                                        new Date(selectedUser.registrationDate).getMonth() - 6,
                                      ),
                                    ).toISOString(),
                                  )}{" "}
                                  -{" "}
                                  {formatDate(
                                    new Date(
                                      new Date(selectedUser.registrationDate).setMonth(
                                        new Date(selectedUser.registrationDate).getMonth() - 5,
                                      ),
                                    ).toISOString(),
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="text-amber-500 font-medium">WELCOME10</span>
                                </TableCell>
                                <TableCell>$39.99</TableCell>
                                <TableCell>
                                  <span className="text-muted-foreground text-xs">10% discount</span>
                                </TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell className="font-medium">Mobile</TableCell>
                                <TableCell>
                                  {formatDate(
                                    new Date(
                                      new Date(selectedUser.registrationDate).setMonth(
                                        new Date(selectedUser.registrationDate).getMonth() - 8,
                                      ),
                                    ).toISOString(),
                                  )}{" "}
                                  -{" "}
                                  {formatDate(
                                    new Date(
                                      new Date(selectedUser.registrationDate).setMonth(
                                        new Date(selectedUser.registrationDate).getMonth() - 7,
                                      ),
                                    ).toISOString(),
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="text-amber-500 font-medium">MOBILE15</span>
                                </TableCell>
                                <TableCell>$42.49</TableCell>
                                <TableCell>
                                  <span className="text-muted-foreground text-xs">Mobile only</span>
                                </TableCell>
                              </TableRow>
                            </>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-24 text-muted-foreground">
                      No subscription history for free users
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search subscribers..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-8"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => setSelectedUser(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
