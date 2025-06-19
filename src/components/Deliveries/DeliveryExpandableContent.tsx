import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
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
import { Save, Trash2 } from 'lucide-react';
import { ConfirmDeleteDialog } from '../DeleteDialog';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface DeliveryExpandableContentProps {
  delivery: Delivery;
  onSave: (data: Delivery) => void;
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
  tip: z.string(),
  deliverytime: z.string(),
  dayornight: z.string(),
  special_instructions: z.string(),
});

export type Delivery = z.infer<typeof deliverySchema>;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DELETE_URL = `${API_BASE_URL}/api/delivery/delete`;

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

  const handleSubmit = (data: Delivery) => {
    onSave(data);
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
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    } else {
      alert('Failed to delete delivery');
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          <div className="bg-background grid gap-4 rounded-md border p-4">
            <h4 className="text-foreground/80 text-sm font-semibold">
              Customer Info
            </h4>
            <FormField
              control={form.control}
              name="customer_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-white"
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
                    <Input className="bg-white" {...field} />
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
                      <SelectTrigger className="w-full bg-white">
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
                    <Input className="bg-white" {...field} />
                  </FormControl>
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
                    <Input className="bg-white" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="bg-background grid gap-4 rounded-md border p-4">
            <h4 className="text-foreground/80 text-sm font-semibold">
              Delivery Details
            </h4>
            <FormField
              control={form.control}
              name="delivery_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <Input className="bg-white" {...field} />
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
                    <Input className="bg-white" {...field} />
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
                      <SelectTrigger className="w-full bg-white">
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
                      <SelectTrigger className="w-full bg-white">
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
                        className="bg-white"
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
          <div className="bg-background grid gap-4 rounded-md border p-4">
            <h4 className="text-foreground/80 text-sm font-semibold">Extras</h4>
            <FormField
              control={form.control}
              name="bag_limes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limes</FormLabel>
                  <FormControl>
                    <Input className="bg-white" {...field} />
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
                    <Input className="bg-white" {...field} />
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
                    <Input className="bg-white" {...field} />
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
                    <Input className="bg-white" {...field} />
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
                    <Input className="bg-white" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
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
                    value={field.value ? new Date(field.value) : undefined}
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
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="submit"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Save size={16} /> Save
          </Button>
          <Button
            variant="destructive"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(delivery.id);
            }}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </Button>
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
