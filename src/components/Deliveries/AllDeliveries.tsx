import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from 'lucide-react';
import { SuccessDialog } from '../SuccessDialog';
import { format } from 'date-fns';
import {
  DeliveryExpandableContent,
  type Delivery,
} from './DeliveryExpandableContent';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/delivery/getall`;
const UPDATE_URL = `${API_BASE_URL}/api/delivery/edit`;

export default function AllDeliveriesTable() {
  const [expandedRow, setExpandedRow] = React.useState<number | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const itemsPerPage = 25;
  const queryClient = useQueryClient();

  const { data, isPending, isError } = useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL, {
        headers: {
          'auth-token': token || '',
        },
      });
      const json = await response.json();
      return json.sort(
        (a: Delivery, b: Delivery) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      );
    },
  });

  const handleSave = async (row: Delivery) => {
    let deliveryTimeFormatted = row.deliverytime || '';
    let dayOrNight = '';

    if (deliveryTimeFormatted) {
      const [hourStr, minuteStr] = deliveryTimeFormatted.split(':');
      let hour = parseInt(hourStr, 10);
      const minute = minuteStr || '00';

      if (hour >= 12) {
        dayOrNight = 'PM';
        if (hour > 12) hour -= 12;
      } else {
        dayOrNight = 'AM';
        if (hour === 0) hour = 12;
      }

      deliveryTimeFormatted = `${hour}:${minute}`;
    }

    // Update row with formatted values
    row.deliverytime = deliveryTimeFormatted;
    row.dayornight = dayOrNight;

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
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      setSuccessOpen(true);
    } else {
      alert('Update failed');
    }
  };

  if (isPending) {
    return <div className="flex justify-center p-8">Loading deliveries...</div>;
  }

  if (isError) {
    return (
      <div className="flex justify-center p-8 text-red-500">
        Error loading deliveries
      </div>
    );
  }

  const filteredData =
    data?.filter((row: Delivery) =>
      row.customer_name.toLowerCase().includes(globalFilter.toLowerCase()),
    ) || [];

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
            <CardDescription className="text-start">
              <p>
                View all deliveries, edit information, or delete a delivery.
              </p>
              <p>
                Click on a row to expand and view information for that delivery
              </p>
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
                <TableHead>Delivery Address</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Cooler Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row: Delivery) => {
                const isExpanded = expandedRow === row.id;
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
                      <TableCell className="text-start">
                        {row.start_date &&
                        !isNaN(new Date(row.start_date).getTime())
                          ? format(new Date(new Date(row.start_date).getTime() + 24 * 60 * 60 * 1000), 'PPP')
                          : 'Invalid date'}
                      </TableCell>
                      <TableCell className="text-start">
                        {row.end_date &&
                        !isNaN(new Date(row.end_date).getTime())
                          ? format(new Date(new Date(row.end_date).getTime() + 24 * 60 * 60 * 1000), 'PPP')
                          : 'Invalid date'}
                      </TableCell>
                      <TableCell className="text-start">
                        {row.delivery_address}
                      </TableCell>
                      <TableCell className="text-start">
                        {row.customer_name}
                      </TableCell>
                      <TableCell className="text-start">
                        {row.cooler_size}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="rounded-md bg-white p-4"
                        >
                          <DeliveryExpandableContent
                            delivery={row}
                            onSave={handleSave}
                          />
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
      <SuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} />
    </>
  );
}
