import React from 'react';
import { format, startOfToday } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

const API_URL = buildApiUrl('/api/delivery/getall');
const UPDATE_URL = buildApiUrl('/api/delivery/edit');
const LAST_YEAR_DELIVERIES_URL = buildApiUrl('/api/delivery/getlastyear');
const ITEMS_PER_PAGE = 25;
const DATE_FILTERS = ['upcoming', 'past', 'all'] as const;
type DateFilter = (typeof DATE_FILTERS)[number];

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

// API dates come back one day behind; shift forward to the intended calendar day.
function toDisplayDate(dateValue: string) {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000);
}

function formatDisplayDate(dateValue: string) {
  const date = toDisplayDate(dateValue);
  return date ? format(date, 'MMM d') : 'Invalid date';
}

function matchesDateFilter(row: Delivery, filter: DateFilter) {
  if (filter === 'all') return true;
  const end = toDisplayDate(row.end_date);
  if (!end) return true;
  const isUpcoming = end >= startOfToday();
  return filter === 'upcoming' ? isUpcoming : !isUpcoming;
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
  const [dateFilter, setDateFilter] = React.useState<DateFilter>('all');
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

  const search = globalFilter.trim().toLowerCase();
  const filteredData: Delivery[] =
    data?.filter(
      (row: Delivery) =>
        matchesDateFilter(row, dateFilter) &&
        [row.customer_name, row.delivery_address, row.customer_phone].some(
          (value) => value?.toLowerCase().includes(search),
        ),
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
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-24 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading deliveries...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-xl border p-8 text-center text-sm">
        Error loading deliveries: {getErrorMessage(error)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deliveries</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {data?.length ?? 0} total. Click a row to view or edit.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw className={cn(isFetching && 'animate-spin')} />
          </Button>
          <Button variant="outline" onClick={downloadLastYearDeliveriesCSV}>
            <Download />
            Last year CSV
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search name, address, phone"
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setPage(0);
              }}
              className="pl-9"
            />
          </div>
          <div className="bg-muted inline-flex rounded-lg p-1">
            {DATE_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setDateFilter(filter);
                  setPage(0);
                }}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors',
                  dateFilter === filter
                    ? 'bg-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {emptySearchResult ? (
          <div className="text-muted-foreground p-12 text-center text-sm">
            No deliveries match these filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="text-muted-foreground hover:bg-transparent [&>th]:text-xs [&>th]:font-medium">
                <TableHead className="pl-4">Dates</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="hidden lg:table-cell">Order</TableHead>
                <TableHead className="hidden sm:table-cell">Time</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => {
                const isExpanded = expandedRow === row.id;
                const toggle = () => setExpandedRow(isExpanded ? null : row.id);

                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      onClick={toggle}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggle();
                        }
                      }}
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      className={cn(
                        'focus-visible:bg-accent/60 cursor-pointer outline-none',
                        isExpanded &&
                          'bg-accent/60 hover:bg-accent/60 border-b-0',
                      )}
                    >
                      <TableCell className="py-3 pl-4 font-medium tabular-nums">
                        {formatDisplayDate(row.start_date)}
                        <span className="text-muted-foreground"> – </span>
                        {formatDisplayDate(row.end_date)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{row.customer_name}</div>
                        <div className="text-muted-foreground text-xs tabular-nums">
                          {row.customer_phone}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>{row.delivery_address}</div>
                        {row.neighborhood_name && (
                          <div className="text-muted-foreground text-xs">
                            {row.neighborhood_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="capitalize">
                          {row.cooler_num} × {row.cooler_size?.toLowerCase()}
                        </div>
                        <div className="text-muted-foreground text-xs capitalize">
                          {row.ice_type?.toLowerCase()}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden tabular-nums sm:table-cell">
                        {row.deliverytime
                          ? `${row.deliverytime} ${row.dayornight}`
                          : '–'}
                      </TableCell>
                      <TableCell className="pr-4">
                        <ChevronDown
                          className={cn(
                            'text-muted-foreground h-4 w-4 transition-transform',
                            isExpanded && 'rotate-180',
                          )}
                        />
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-accent/30 hover:bg-accent/30">
                        <TableCell
                          colSpan={6}
                          className="p-4 whitespace-normal sm:p-6"
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
        )}

        <div className="text-muted-foreground flex items-center justify-between border-t px-4 py-3 text-sm">
          <span className="tabular-nums">
            {currentStart}–{currentEnd} of {totalRows}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={page === 0}
              onClick={() =>
                setPage((currentPage) => Math.max(0, currentPage - 1))
              }
              aria-label="Previous page"
            >
              <ChevronLeft />
            </Button>
            <span className="px-1 tabular-nums">
              {Math.min(page + 1, Math.max(totalPages, 1))} /{' '}
              {Math.max(totalPages, 1)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((currentPage) => currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
