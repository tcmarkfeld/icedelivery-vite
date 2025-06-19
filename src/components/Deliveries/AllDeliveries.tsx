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
import { format } from 'date-fns';
import {
  DeliveryExpandableContent,
  type Delivery,
} from './DeliveryExpandableContent';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/delivery/getall`;
const UPDATE_URL = `${API_BASE_URL}/api/delivery/edit`;

export default function AllDeliveriesTable() {
  const [expandedRow, setExpandedRow] = React.useState<number | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState('');
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
      toast.success('Successfully updated delivery information.');
    } else {
      toast.error('Failed to update delivery information.');
    }
  };

  function convertDeliveriesToCSV(deliveries: Delivery[]): string {
    if (!deliveries || deliveries.length === 0) return '';

    const headers = [
      'id',
      'start_date',
      'end_date',
      'cooler_size',
      'ice_type',
      'delivery_address',
      'neighborhood',
      'neighborhood_name',
      'customer_name',
      'customer_phone',
      'customer_email',
      'cooler_num',
      'bag_limes',
      'bag_oranges',
      'bag_lemons',
      'marg_salt',
      'freeze_pops',
      'tip',
      'deliverytime',
      'dayornight',
      'special_instructions',
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const escape = (value: any): string =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const rows = deliveries.map((delivery) =>
      headers.map((key) => escape(delivery[key as keyof Delivery])).join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }

  async function downloadLastYearDeliveriesCSV() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/delivery/getlastyear`, {
        headers: { 'auth-token': token || '' },
      });
      if (!response.ok) toast.error('Failed to download deliveries');

      const deliveries = await response.json();
      console.log(deliveries);

      const csv = convertDeliveriesToCSV(deliveries);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'deliveries_last_year.csv';
      link.click();

      URL.revokeObjectURL(url);
      toast.success("Successfully downloaded last year's deliveries as a CSV");
    } catch (error) {
      console.error('CSV download failed:', error);
      toast.error('Could not download deliveries CSV.');
    }
  }

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
        <CardHeader className="flex h-fit w-full flex-row items-center justify-between">
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
          <div className="flex flex-row gap-2">
            <Button variant="outline" onClick={downloadLastYearDeliveriesCSV}>
              Download Last Year's Deliveries
            </Button>
            <Input
              placeholder="Search by name..."
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
                          ? format(
                              new Date(
                                new Date(row.start_date).getTime() +
                                  24 * 60 * 60 * 1000,
                              ),
                              'PPP',
                            )
                          : 'Invalid date'}
                      </TableCell>
                      <TableCell className="text-start">
                        {row.end_date &&
                        !isNaN(new Date(row.end_date).getTime())
                          ? format(
                              new Date(
                                new Date(row.end_date).getTime() +
                                  24 * 60 * 60 * 1000,
                              ),
                              'PPP',
                            )
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
    </>
  );
}
