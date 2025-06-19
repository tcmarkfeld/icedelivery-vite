import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DatePicker } from '@/components/DatePicker';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Save,
  Trash2,
} from 'lucide-react';
import { ConfirmDeleteDialog } from '../DeleteDialog';
import { SuccessDialog } from '../SuccessDialog';
import { Label } from '../ui/label';

interface Delivery {
  id: number;
  start_date: string;
  end_date: string;
  cooler_size: string;
  ice_type: string;
  delivery_address: string;
  neighborhood: string;
  neighborhood_name?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  cooler_num: number;
  bag_limes: number;
  bag_oranges: number;
  bag_lemons: number;
  marg_salt: number;
  freeze_pops: number;
  tip: string;
  deliverytime: string;
  dayornight: string;
  special_instructions: string;
}

const API_URL = 'https://ice-delivery.fly.dev/api/delivery/getall';
const UPDATE_URL = 'https://ice-delivery.fly.dev/api/delivery/edit';
const DELETE_URL = 'https://ice-delivery.fly.dev/api/delivery/delete';

export default function AllDeliveriesTable() {
  const [data, setData] = React.useState<Delivery[]>([]);
  const [expandedRow, setExpandedRow] = React.useState<number | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });
  const [page, setPage] = React.useState(0);
  const itemsPerPage = 25;

  React.useEffect(() => {
    async function fetchDeliveries() {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL, {
        headers: {
          'auth-token': token || '',
        },
      });
      const json = await response.json();
      const ordered = json.sort(
        (a: Delivery, b: Delivery) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      );
      setData(ordered);
    }
    fetchDeliveries();
  }, []);

  const handleChange = (
    rowIndex: number,
    key: keyof Delivery,
    value: string | number,
  ) => {
    const newData = [...data];
    newData[rowIndex][key] = value as never;
    setData(newData);
  };

  const handleSave = async (row: Delivery) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${UPDATE_URL}/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token || '',
      },
      body: JSON.stringify(row),
    });
    if (response.ok) {
      setSuccessOpen(true);
    } else {
      alert('Update failed');
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteDialog({ open: true, id });
  };

  const handleDeleteConfirmed = async () => {
    if (deleteDialog.id === null) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`${DELETE_URL}/${deleteDialog.id}`, {
      method: 'DELETE',
      headers: {
        'auth-token': token || '',
      },
    });

    if (response.ok) {
      setData((prev) =>
        prev.filter((delivery) => delivery.id !== deleteDialog.id),
      );
    } else {
      alert('Failed to delete delivery');
    }
    setDeleteDialog({ open: false, id: null });
  };

  const filteredData = data.filter((row) =>
    row.customer_name.toLowerCase().includes(globalFilter.toLowerCase()),
  );

  const paginatedData = filteredData.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <>
      <Card className="p-4">
        <CardHeader className="flex h-fit w-full flex-row items-start justify-between">
          <div>
            <CardTitle className="text-start text-xl">All Deliveries</CardTitle>
            <CardDescription>
              <p>
                View all deliveries, edit information, or delete a delivery.
              </p>
              <p> Click on row to expand and view all delivery information</p>
            </CardDescription>
          </div>
          <div className="min-w-[200px]">
            <Input
              placeholder="Search by customer name..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="mx-auto mb-4 w-full max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Cooler Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => {
                const isExpanded = expandedRow === row.id;
                const globalIndex = data.findIndex((d) => d.id === row.id);
                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                      className="hover:bg-muted/50 cursor-pointer"
                    >
                      <TableCell className="w-4">
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </TableCell>
                      <TableCell>
                        <DatePicker
                          value={new Date(row.start_date)}
                          onChange={(date) => {
                            if (date) {
                              const adjustedDate = new Date(date);
                              adjustedDate.setHours(12, 0, 0, 0);
                              handleChange(
                                globalIndex,
                                'start_date',
                                adjustedDate.toISOString().split('T')[0],
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <DatePicker
                          value={new Date(row.end_date)}
                          onChange={(date) => {
                            if (date) {
                              const adjustedDate = new Date(date);
                              adjustedDate.setHours(12, 0, 0, 0);
                              handleChange(
                                globalIndex,
                                'end_date',
                                adjustedDate.toISOString().split('T')[0],
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="bg-white"
                          value={row.delivery_address}
                          onChange={(e) =>
                            handleChange(
                              globalIndex,
                              'delivery_address',
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="bg-white"
                          value={row.customer_name}
                          onChange={(e) =>
                            handleChange(
                              globalIndex,
                              'customer_name',
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="bg-white"
                          value={row.cooler_size}
                          onChange={(e) =>
                            handleChange(
                              globalIndex,
                              'cooler_size',
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="rounded-md bg-white p-4"
                        >
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                            <div className="bg-background grid rounded-md border p-2 text-start">
                              <h4 className="text-foreground/80 text-sm font-semibold">
                                Customer Info
                              </h4>
                              <Label>Phone</Label>
                              <Input
                                className="bg-white"
                                value={row.customer_phone}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'customer_phone',
                                    e.target.value,
                                  )
                                }
                              />
                              <Label>Email</Label>
                              <Input
                                className="bg-white"
                                value={row.customer_email}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'customer_email',
                                    e.target.value,
                                  )
                                }
                              />
                              <Label>Neighborhood</Label>
                              <Input
                                className="bg-white"
                                value={row.neighborhood}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'neighborhood',
                                    e.target.value,
                                  )
                                }
                              />
                              <Label># Of Coolers</Label>
                              <Input
                                className="bg-white"
                                type="number"
                                value={row.cooler_num.toString()}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'cooler_num',
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                              <Label>Ice Type</Label>
                              <Input
                                className="bg-white"
                                value={row.ice_type}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'ice_type',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="bg-background grid gap-4 rounded-md border p-4">
                              <h4 className="text-foreground/80 text-sm font-semibold">
                                Extras
                              </h4>
                              <Label>Limes</Label>
                              <Input
                                className="bg-white"
                                type="number"
                                value={row.bag_limes.toString()}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'bag_limes',
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                              <Label>Oranges</Label>
                              <Input
                                className="bg-white"
                                type="number"
                                value={row.bag_oranges.toString()}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'bag_oranges',
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                              <Label>Lemons</Label>
                              <Input
                                className="bg-white"
                                type="number"
                                value={row.bag_lemons.toString()}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'bag_lemons',
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                              <Label>Freeze Pops</Label>
                              <Input
                                className="bg-white"
                                type="number"
                                value={row.freeze_pops.toString()}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'freeze_pops',
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                              <Label>Marg Salt</Label>
                              <Input
                                className="bg-white"
                                type="number"
                                value={row.marg_salt.toString()}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'marg_salt',
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                            </div>
                            <div className="bg-background grid gap-4 rounded-md border p-4">
                              <h4 className="text-foreground/80 text-sm font-semibold">
                                Delivery Details
                              </h4>
                              <Label>Tip</Label>
                              <Input
                                className="bg-white"
                                value={row.tip}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'tip',
                                    e.target.value,
                                  )
                                }
                              />
                              <Label>Delivery Time (first day)</Label>
                              <Input
                                className="bg-white"
                                value={row.deliverytime}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'deliverytime',
                                    e.target.value,
                                  )
                                }
                              />
                              <Label>AM/PM</Label>
                              <Input
                                className="bg-white"
                                value={row.dayornight}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'dayornight',
                                    e.target.value,
                                  )
                                }
                              />
                              <Label>Special Instructions</Label>
                              <Input
                                className="bg-white"
                                value={row.special_instructions}
                                onChange={(e) =>
                                  handleChange(
                                    globalIndex,
                                    'special_instructions',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="col-span-full flex justify-end gap-2">
                              <Button
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(row.id);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Trash2 size={16} /> Delete
                              </Button>
                              <Button
                                onClick={() => handleSave(row)}
                                className="flex items-center gap-2"
                              >
                                <Save size={16} /> Save
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between">
            <Button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              variant="ghost"
              className="cursor-pointer hover:bg-transparent"
            >
              <ChevronLeft /> Previous
            </Button>
            <p className="text-sm">
              Page {page + 1} of {totalPages}
            </p>
            <Button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              variant="ghost"
              className="cursor-pointer hover:bg-transparent"
            >
              Next <ChevronRight />
            </Button>
          </div>
        </CardContent>
      </Card>
      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onCancel={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDeleteConfirmed}
      />
      <SuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} />
    </>
  );
}
