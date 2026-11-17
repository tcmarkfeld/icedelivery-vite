import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { Input } from '../ui/input';
import { DatePicker } from '../DatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { ConfirmDeleteDialog } from '../DeleteDialog';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';
import {
  buckIsland,
  corollaLight,
  crownPoint,
  cruzBay,
  currituckClub,
  hijo,
  klmpq,
  monterayShores,
  oceanHill,
  pineIsland,
  sectionA,
  sectionB,
  sectionC,
  sectionD,
  sectionE,
  sectionF,
  spinDrift,
  whalehead,
  whaleheadRight,
} from '@/components/constants/neighborhoods';

interface DeliveryExpandableContentProps {
  delivery: Delivery;
  onSave: (data: Delivery) => Promise<void>;
}

const deliverySchema = z.object({
  id: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  cooler_size: z.string(),
  ice_type: z.string(),
  delivery_address: z.string(),
  neighborhood: z.string(),
  neighborhood_name: z.string().optional(),
  customer_name: z.string(),
  customer_phone: z.string(),
  customer_email: z.string().optional(),
  cooler_num: z.string(),
  bag_limes: z.string(),
  bag_oranges: z.string(),
  bag_lemons: z.string(),
  marg_salt: z.string(),
  freeze_pops: z.string(),
  tip: z
    .string()
    .min(1, 'Tip is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Tip must be a valid dollar amount'),
  deliverytime: z.string(),
  dayornight: z.string(),
  special_instructions: z.string(),
});

export type Delivery = z.infer<typeof deliverySchema>;
const DELETE_URL = buildApiUrl('/api/delivery/delete');
const sectionCardClassName = 'grid content-start gap-3';
const sectionTitleClassName =
  'text-muted-foreground text-xs font-medium tracking-wide uppercase';
const inputClassName = 'bg-white';
const lookupRules = [
  { ids: sectionA, value: '7' },
  { ids: sectionB, value: '8' },
  { ids: sectionC, value: '9' },
  { ids: sectionD, value: '10' },
  { ids: sectionE, value: '11' },
  { ids: sectionF, value: '12' },
  { ids: hijo, value: '13' },
  { ids: klmpq, value: '14' },
  { ids: crownPoint, value: '15' },
  { ids: spinDrift, value: '6' },
  { ids: pineIsland, value: '5' },
  { ids: buckIsland, value: '16' },
  { ids: oceanHill, value: '1' },
  { ids: corollaLight, value: '2' },
  { ids: cruzBay, value: '19' },
  { ids: whalehead, value: '3' },
  { ids: whaleheadRight, value: '18' },
  { ids: monterayShores, value: '17' },
  { ids: currituckClub, value: '4' },
] as const;

export function DeliveryExpandableContent({
  delivery,
  onSave,
}: DeliveryExpandableContentProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });
  const queryClient = useQueryClient();

  const form = useForm<Delivery>({
    resolver: zodResolver(deliverySchema),
    defaultValues: delivery,
  });
  const watchedAddress =
    useWatch({ control: form.control, name: 'delivery_address' }) || '';

  useEffect(() => {
    const cleaned = watchedAddress.replace(/[^a-zA-Z]/g, '').toUpperCase();

    for (const entry of lookupRules) {
      if (entry.ids.includes(cleaned)) {
        form.setValue('neighborhood', entry.value);
        break;
      }
    }
  }, [form, watchedAddress]);

  const handleSubmit = (data: Delivery) => {
    return onSave(data);
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
      toast.success('Successfully deleted delivery');
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    } else {
      toast.error('Failed to delete delivery');
    }
    setDeleteDialog({ open: false, id: null });
  };

  function formatPhoneNumber(value: string) {
    // Remove non-digit characters
    const cleaned = value.replace(/\D/g, '').slice(0, 10); // Enforce 10-digit max

    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;

    const [, area, middle, last] = match;

    if (last) return `(${area}) ${middle}-${last}`;
    if (middle) return `(${area}) ${middle}`;
    if (area) return `(${area}`;
    return '';
  }

  function convert12To24(time: string, ampm: string): string {
    if (!time || !ampm) return '';
    const [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr, 10);

    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  function parseApiDateToLocalCalendarDate(value: string) {
    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return undefined;
    }

    return new Date(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate(),
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
          <div className={sectionCardClassName}>
            <h4 className={sectionTitleClassName}>Customer Info</h4>
            <FormField
              control={form.control}
              name="customer_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      className={inputClassName}
                      {...field}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input className={inputClassName} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neighborhood</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`w-full ${inputClassName}`}>
                        <SelectValue placeholder="Select neighborhood..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Ocean Hill</SelectItem>
                        <SelectItem value="2">Corolla Light</SelectItem>
                        <SelectItem value="3">Whalehead</SelectItem>
                        <SelectItem value="18">Whalehead Right</SelectItem>
                        <SelectItem value="19">
                          Cruz Bay (Soundfront at Corolla Bay)
                        </SelectItem>
                        <SelectItem value="17">Monteray Shores</SelectItem>
                        <SelectItem value="16">Buck Island</SelectItem>
                        <SelectItem value="15">Crown Point</SelectItem>
                        <SelectItem value="14">KLMPQ</SelectItem>
                        <SelectItem value="13">HIJO</SelectItem>
                        <SelectItem value="12">Section F</SelectItem>
                        <SelectItem value="4">Currituck Club</SelectItem>
                        <SelectItem value="11">Section E</SelectItem>
                        <SelectItem value="10">Section D</SelectItem>
                        <SelectItem value="9">Section C</SelectItem>
                        <SelectItem value="8">Section B</SelectItem>
                        <SelectItem value="7">Section A</SelectItem>
                        <SelectItem value="6">Spindrift</SelectItem>
                        <SelectItem value="5">Pine Island</SelectItem>
                        <SelectItem value="20">WHC South Lawn</SelectItem>
                        <SelectItem value="21">WHC North Lawn</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min={0}
                      required
                      className={inputClassName}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="special_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Instructions</FormLabel>
                  <FormControl>
                    <Input className={inputClassName} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className={sectionCardClassName}>
            <h4 className={sectionTitleClassName}>Delivery Details</h4>
            <FormField
              control={form.control}
              name="delivery_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <Input className={inputClassName} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cooler_num"
              render={({ field }) => (
                <FormItem>
                  <FormLabel># Of Coolers</FormLabel>
                  <FormControl>
                    <Input className={inputClassName} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cooler_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cooler Size</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`w-full ${inputClassName}`}>
                        <SelectValue placeholder="Select cooler size..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="40 QUART">40 Quart</SelectItem>
                        <SelectItem value="62 QUART">62 Quart</SelectItem>
                        <SelectItem value="200 QUART">200 Quart</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ice_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ice Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`w-full ${inputClassName}`}>
                        <SelectValue placeholder="Select ice type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOOSE ICE">Loose ice</SelectItem>
                        <SelectItem value="BAGGED ICE">Bagged ice</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deliverytime"
              render={({ field }) => {
                const ampm = form.getValues('dayornight'); // "AM" or "PM"
                const time24 = convert12To24(field.value, ampm); // "14:30" etc.

                return (
                  <FormItem>
                    <FormLabel>Delivery Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        className={inputClassName}
                        value={time24}
                        onChange={(e) => {
                          const [hourStr, minute] = e.target.value.split(':');
                          const hour = parseInt(hourStr, 10);
                          const ampm = hour >= 12 ? 'PM' : 'AM';
                          const hour12 = hour % 12 === 0 ? 12 : hour % 12;
                          const formatted = `${hour12.toString().padStart(2, '0')}:${minute}`;

                          form.setValue('deliverytime', formatted);
                          form.setValue('dayornight', ampm);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
          </div>
          <div className={sectionCardClassName}>
            <h4 className={sectionTitleClassName}>Extras</h4>
            <FormField
              control={form.control}
              name="bag_limes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limes</FormLabel>
                  <FormControl>
                    <Input className={inputClassName} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bag_oranges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Oranges</FormLabel>
                  <FormControl>
                    <Input className={inputClassName} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bag_lemons"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lemons</FormLabel>
                  <FormControl>
                    <Input className={inputClassName} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="freeze_pops"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Freeze Pops</FormLabel>
                  <FormControl>
                    <Input className={inputClassName} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="marg_salt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marg Salt</FormLabel>
                  <FormControl>
                    <Input className={inputClassName} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className={sectionCardClassName}>
            <h4 className={sectionTitleClassName}>Schedule</h4>
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={
                        field.value
                          ? parseApiDateToLocalCalendarDate(field.value)
                          : undefined
                      }
                      onChange={(date) => {
                        if (date) {
                          field.onChange(new Date(date).toISOString());
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={
                        field.value
                          ? parseApiDateToLocalCalendarDate(field.value)
                          : undefined
                      }
                      onChange={(date) => {
                        if (date) {
                          field.onChange(new Date(date).toISOString());
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(delivery.id);
            }}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 /> Delete delivery
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              onClick={() => form.reset()}
              disabled={!form.formState.isDirty}
            >
              Discard changes
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="animate-spin" />
              )}
              Save changes
            </Button>
          </div>
        </div>
      </form>
      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onCancel={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDeleteConfirmed}
      />
    </Form>
  );
}
