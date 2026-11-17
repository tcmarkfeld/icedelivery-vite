import '../App.css';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TimePicker } from '@/components/TimePicker';
import { DatePicker } from '@/components/DatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const EXTRA_FIELD_KEYS = {
  Limes: 'limes',
  Lemons: 'lemons',
  Oranges: 'oranges',
  MargSalt: 'margSalt',
  FreezePops: 'freezePops',
} as const;

type ExtraFieldKey = (typeof EXTRA_FIELD_KEYS)[keyof typeof EXTRA_FIELD_KEYS];

type FormValues = z.infer<typeof formSchema>;
type FormFieldName = keyof FormValues;

const extraFieldLabelMap: Record<ExtraFieldKey, string> = {
  [EXTRA_FIELD_KEYS.Limes]: 'Limes',
  [EXTRA_FIELD_KEYS.Lemons]: 'Lemons',
  [EXTRA_FIELD_KEYS.Oranges]: 'Oranges',
  [EXTRA_FIELD_KEYS.MargSalt]: 'Marg Salt',
  [EXTRA_FIELD_KEYS.FreezePops]: 'Freeze Pops',
};

const neighborhoodOptions = [
  { value: '1', label: 'Ocean Hill' },
  { value: '2', label: 'Corolla Light' },
  { value: '3', label: 'Whalehead' },
  { value: '18', label: 'Whalehead Right' },
  { value: '19', label: 'Cruz Bay (Soundfront at Corolla Bay)' },
  { value: '17', label: 'Monteray Shores' },
  { value: '16', label: 'Buck Island' },
  { value: '15', label: 'Crown Point' },
  { value: '14', label: 'KLMPQ' },
  { value: '13', label: 'HIJO' },
  { value: '12', label: 'Section F' },
  { value: '4', label: 'Currituck Club' },
  { value: '11', label: 'Section E' },
  { value: '10', label: 'Section D' },
  { value: '9', label: 'Section C' },
  { value: '8', label: 'Section B' },
  { value: '7', label: 'Section A' },
  { value: '6', label: 'Spindrift' },
  { value: '5', label: 'Pine Island' },
  { value: '20', label: 'WHC South Lawn' },
  { value: '21', label: 'WHC North Lawn' },
] as const;

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

const formInputClassName = 'bg-white';

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4 py-6 first:pt-0 md:grid-cols-[200px_1fr] md:gap-8">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      {children}
    </section>
  );
}

const formSchema = z
  .object({
    customerName: z
      .string()
      .min(2, 'Customer name must be at least 2 characters')
      .max(100, 'Customer name cannot exceed 100 characters'),
    deliveryAddress: z
      .string()
      .min(5, 'Delivery address must be at least 5 characters')
      .max(200, 'Delivery address cannot exceed 200 characters'),
    phone: z
      .string()
      .regex(
        /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
        'Please enter a valid phone number',
      ),
    neighborhood: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    coolerSize: z.string().min(1, 'Cooler size is required'),
    iceType: z.string().min(1, 'Ice type is required'),
    coolerNum: z.string(),
    tip: z
      .string()
      .min(1, 'Tip is required')
      .regex(/^\d+(\.\d{1,2})?$/, 'Tip must be a valid dollar amount'),
    customerEmail: z.string().optional(),
    limes: z.string(),
    oranges: z.string(),
    lemons: z.string(),
    margSalt: z.string(),
    freezePops: z.string(),
    deliveryTime: z.string().optional(),
    specialInstructions: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      path: ['endDate'],
      message: 'End date must be after or equal to start date',
    },
  );

function formatPhoneNumber(value: string) {
  const cleaned = value.replace(/\D/g, '').slice(0, 10);
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

  if (!match) return value;

  const [, area, middle, last] = match;

  if (last) return `(${area}) ${middle}-${last}`;
  if (middle) return `(${area}) ${middle}`;
  if (area) return `(${area}`;

  return '';
}

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

function AddDelivery() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      deliveryAddress: '',
      phone: '',
      neighborhood: '',
      startDate: new Date(),
      endDate: new Date(),
      coolerSize: '',
      iceType: '',
      coolerNum: '1',
      tip: '',
      customerEmail: '',
      limes: '0',
      oranges: '0',
      lemons: '0',
      margSalt: '0',
      freezePops: '0',
      deliveryTime: '',
      specialInstructions: '',
    },
  });

  const watchedAddress =
    useWatch({ control: form.control, name: 'deliveryAddress' }) || '';

  useEffect(() => {
    const cleaned = watchedAddress.replace(/[^a-zA-Z]/g, '').toUpperCase();

    for (const entry of lookupRules) {
      if (entry.ids.includes(cleaned)) {
        form.setValue('neighborhood', entry.value);
        break;
      }
    }
  }, [form, watchedAddress]);

  async function onSubmit(values: FormValues) {
    const token = localStorage.getItem('token');
    const { deliveryTimeFormatted, dayOrNight } = formatDeliveryTime(
      values.deliveryTime || '',
    );

    try {
      const res = await fetch(buildApiUrl('/api/delivery/add'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'auth-token': token || '',
        },
        body: JSON.stringify({
          delivery_address: values.deliveryAddress,
          customer_name: values.customerName,
          customer_phone: values.phone,
          customer_email: values.customerEmail,
          start_date: new Date(values.startDate),
          end_date: new Date(values.endDate),
          special_instructions: values.specialInstructions || '',
          cooler_size: values.coolerSize,
          ice_type: values.iceType,
          neighborhood: values.neighborhood,
          cooler_num: values.coolerNum,
          bag_limes: values.limes,
          bag_lemons: values.lemons,
          bag_oranges: values.oranges,
          marg_salt: values.margSalt,
          freeze_pops: values.freezePops,
          tip: values.tip,
          deliverytime: deliveryTimeFormatted,
          dayornight: dayOrNight,
        }),
      });

      if (res.status === 200) {
        toast.success('Delivery added successfully');
        form.reset();
      } else {
        toast.error(`Failed to add delivery: ${res.statusText}`);
      }
    } catch {
      toast.error('Failed to add delivery. Check your connection.');
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">New Delivery</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Enter the customer and order details to schedule a delivery.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="rounded-xl border bg-white shadow-sm"
        >
          <div className="divide-y px-4 pt-6 sm:px-6">
            <FormSection
              title="Customer"
              description="Who the delivery is for."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Pat Lewis"
                          {...field}
                          className={formInputClassName}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(000) 000-0000"
                          {...field}
                          className={formInputClassName}
                          onChange={(e) => {
                            field.onChange(formatPhoneNumber(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>
                        Email{' '}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@gmail.com"
                          {...field}
                          className={formInputClassName}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            <FormSection
              title="Location"
              description="Neighborhood fills in automatically from the street name."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Main St"
                          {...field}
                          className={formInputClassName}
                        />
                      </FormControl>
                      <FormMessage />
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className={`w-full ${formInputClassName}`}
                          >
                            <SelectValue placeholder="Select neighborhood..." />
                          </SelectTrigger>
                          <SelectContent>
                            {neighborhoodOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            <FormSection
              title="Schedule"
              description="Rental dates and drop-off time."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start date</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select start date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End date</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select end date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery time</FormLabel>
                      <FormControl>
                        <TimePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select delivery time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            <FormSection title="Order" description="Coolers, ice, and tip.">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <FormField
                  control={form.control}
                  name="coolerSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cooler size</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className={`w-full ${formInputClassName}`}
                          >
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="40 Quart">40 Quart</SelectItem>
                            <SelectItem value="62 Quart">62 Quart</SelectItem>
                            <SelectItem value="200 Quart">200 Quart</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="iceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ice type</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className={`w-full ${formInputClassName}`}
                          >
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Loose ice">Loose</SelectItem>
                            <SelectItem value="Bagged ice">Bagged</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coolerNum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coolers</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          className={formInputClassName}
                        />
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
                        <div className="relative">
                          <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                            $
                          </span>
                          <Input
                            type="number"
                            step="1"
                            min={0}
                            required
                            {...field}
                            className={`pl-6 ${formInputClassName}`}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            <FormSection
              title="Extras"
              description="Bags of fruit and add-ons."
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {(Object.values(EXTRA_FIELD_KEYS) as ExtraFieldKey[]).map(
                  (fieldKey) => (
                    <FormField
                      key={fieldKey}
                      control={form.control}
                      name={fieldKey as FormFieldName}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{extraFieldLabelMap[fieldKey]}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="0"
                              {...field}
                              className={formInputClassName}
                              value={
                                typeof field.value === 'number' ||
                                typeof field.value === 'string'
                                  ? field.value
                                  : field.value !== undefined
                                    ? String(field.value)
                                    : ''
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ),
                )}
              </div>
            </FormSection>

            <FormSection
              title="Notes"
              description="Anything the driver should know."
            >
              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special instructions</FormLabel>
                    <FormControl>
                      <textarea
                        rows={3}
                        placeholder="e.g., leave by back door"
                        {...field}
                        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-white px-3 py-2 text-base shadow-xs outline-none focus-visible:ring-[3px] md:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>
          </div>

          <div className="sticky bottom-0 flex flex-col-reverse justify-end gap-2 rounded-b-xl border-t bg-white/90 px-4 py-4 backdrop-blur sm:flex-row sm:px-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => form.reset()}
              disabled={form.formState.isSubmitting}
            >
              Clear form
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="animate-spin" />
              )}
              Save delivery
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default AddDelivery;
