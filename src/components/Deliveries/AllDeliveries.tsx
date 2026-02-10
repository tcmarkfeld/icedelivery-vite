import React from 'react';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  ListFilter,
  RefreshCw,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DeliveryExpandableContent,
  type Delivery,
} from './DeliveryExpandableContent';
import { buildApiUrl } from '@/lib/api';

const API_URL = buildApiUrl('/api/delivery/getall');
const UPDATE_URL = buildApiUrl('/api/delivery/edit');
const LAST_YEAR_DELIVERIES_URL = buildApiUrl('/api/delivery/getlastyear');
const ITEMS_PER_PAGE = 25;
const tableHeaderClassName =
  'bg-slate-100/90 text-[11px] font-semibold tracking-wide text-slate-600 uppercase';

function formatDeliveryTime(deliveryTime: string) {
  if (!deliveryTime) {
    return { deliveryTimeFormatted: '', dayOrNight: '' };
  }

  const [hourStr, minuteStr] = deliveryTime.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  let dayOrNight = 'AM';

  if (hour >= 12) {
    dayOrNight = 'PM';
    if (hour > 12) {
      hour -= 12;
    }
  } else if (hour === 0) {
    hour = 12;
  }

  return {
    deliveryTimeFormatted: `${hour}:${minute}`,
    dayOrNight,
  };
}

function formatDisplayDate(dateValue: string) {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }

  const correctedDate = new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000);
  return format(correctedDate, 'PPP');
}

function escapeCsvValue(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function convertDeliveriesToCSV(deliveries: Delivery[]): string {
  if (!deliveries.length) {
    return '';
  }

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
  ] as const;

  const rows = deliveries.map((delivery) =>
    headers
      .map((key) => escapeCsvValue(delivery[key as keyof Delivery]))
      .join(','),
  );

  return [headers.join(','), ...rows].join('\n');
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

export default function AllDeliveriesTable() {
  const [expandedRow, setExpandedRow] = React.useState<number | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [page, setPage] = React.useState(0);
  const queryClient = useQueryClient();

  const { data, isPending, isError, isFetching, error, refetch } = useQuery({
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
    const { deliveryTimeFormatted, dayOrNight } = formatDeliveryTime(
      row.deliverytime || '',
    );
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
      return;
    }

    toast.error('Failed to update delivery information.');
  };

  const downloadLastYearDeliveriesCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(LAST_YEAR_DELIVERIES_URL, {
        headers: { 'auth-token': token || '' },
      });

      if (!response.ok) {
        toast.error('Failed to download deliveries.');
        return;
      }

      const deliveries = (await response.json()) as Delivery[];
      const csv = convertDeliveriesToCSV(deliveries);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'deliveries_last_year.csv';
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Successfully downloaded last year's deliveries as a CSV.");
    } catch (error) {
      console.error('CSV download failed:', error);
      toast.error('Could not download deliveries CSV.');
    }
  };

  const filteredData =
    data?.filter((row: Delivery) =>
      row.customer_name.toLowerCase().includes(globalFilter.toLowerCase()),
    ) || [];

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const totalRows = filteredData.length;
  const currentStart = totalRows === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const currentEnd = Math.min((page + 1) * ITEMS_PER_PAGE, totalRows);
  const paginatedData = filteredData.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );

  const emptySearchResult = filteredData.length === 0;

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-7xl px-1 pb-10 sm:px-0">
        <Card className="border-sky-100 bg-white/85 p-10 text-center shadow-lg shadow-sky-900/5">
          Loading deliveries...
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-7xl px-1 pb-10 sm:px-0">
        <Card className="border-red-200 bg-red-50/80 p-10 text-center text-red-600">
          Error loading deliveries: {getErrorMessage(error)}
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-1 pb-10 sm:px-0">
      <div className="mb-6 rounded-2xl border border-sky-200/70 bg-linear-to-r from-cyan-50 via-sky-50 to-blue-100 p-5 sm:p-6">
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          All Deliveries
        </h1>
        <p className="mt-2 text-sm text-slate-700 sm:text-base">
          Review, edit, export, and manage the full delivery schedule.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium sm:text-sm">
          <span className="rounded-full bg-white/70 px-3 py-1 text-slate-700">
            Total: {data?.length ?? 0}
          </span>
          <span className="rounded-full bg-white/70 px-3 py-1 text-slate-700">
            Filtered: {filteredData.length}
          </span>
          <span className="rounded-full bg-white/70 px-3 py-1 text-slate-700">
            Per page: {ITEMS_PER_PAGE}
          </span>
        </div>
      </div>

      <Card className="overflow-hidden border-sky-100 bg-white/85 shadow-lg shadow-sky-900/5">
        <CardHeader className="gap-4 border-b border-slate-200/70 bg-slate-50/70">
          <div>
            <CardTitle className="text-xl text-slate-900">Deliveries Table</CardTitle>
            <CardDescription className="text-sm text-slate-600">
              Click a row to expand details, edit fields, or delete a delivery.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by customer name..."
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  setPage(0);
                }}
                className="border-slate-300 bg-white pl-9"
              />
            </div>
            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
                className="w-full border-slate-300 bg-white md:w-auto"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={downloadLastYearDeliveriesCSV}
                className="w-full border-slate-300 bg-white md:w-auto"
              >
                <Download className="h-4 w-4" />
                Download Last Year CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {emptySearchResult ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
              No deliveries found for that search.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="overflow-x-auto">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow className={tableHeaderClassName}>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Delivery Address</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Cooler Size</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((row: Delivery, index: number) => {
                      const isExpanded = expandedRow === row.id;
                      const rowClassName =
                        index % 2 === 0
                          ? 'cursor-pointer bg-white hover:bg-sky-50/70'
                          : 'cursor-pointer bg-slate-50/40 hover:bg-sky-50/70';

                      return (
                        <React.Fragment key={row.id}>
                          <TableRow
                            onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                            className={rowClassName}
                          >
                            <TableCell className="w-10">
                              {isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </TableCell>
                            <TableCell className="text-start">
                              {formatDisplayDate(row.start_date)}
                            </TableCell>
                            <TableCell className="text-start">
                              {formatDisplayDate(row.end_date)}
                            </TableCell>
                            <TableCell className="text-start">
                              {row.delivery_address}
                            </TableCell>
                            <TableCell className="text-start font-medium text-slate-900">
                              {row.customer_name}
                            </TableCell>
                            <TableCell className="text-start text-slate-700">
                              {row.cooler_size}
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow className="bg-slate-50/70">
                              <TableCell colSpan={6} className="p-4">
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
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500 sm:text-sm">
              <span className="inline-flex items-center gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                Showing {currentStart}-{currentEnd} of {totalRows}
              </span>
            </div>
            <Button
              disabled={page === 0}
              onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
              variant="ghost"
              className="justify-start text-slate-700 hover:bg-slate-100"
            >
              <ChevronLeft /> Previous
            </Button>
            <p className="text-sm text-slate-600">
              Page {Math.min(page + 1, Math.max(totalPages, 1))} of{' '}
              {Math.max(totalPages, 1)}
            </p>
            <Button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((currentPage) => currentPage + 1)}
              variant="ghost"
              className="justify-end text-slate-700 hover:bg-slate-100"
            >
              Next <ChevronRight />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
