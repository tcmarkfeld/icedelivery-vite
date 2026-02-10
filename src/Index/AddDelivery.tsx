import '../App.css';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  CalendarDays,
  GlassWater,
  MapPinHouse,
  PackagePlus,
  UserRound,
} from 'lucide-react';

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

const formSectionClassName =
  'rounded-2xl border border-slate-200/80 bg-linear-to-br from-white to-slate-50/80 p-4 shadow-xs sm:p-5 md:p-6';
const formInputClassName =
  'border-slate-300 bg-white shadow-xs focus-visible:ring-2 focus-visible:ring-sky-200';
const sectionTitleClassName =
  'flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-800 uppercase';
const sectionDescriptionClassName = 'mt-1 text-xs text-slate-500';

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

  const watchedAddress = form.watch('deliveryAddress') || '';

  useEffect(() => {
    const cleaned = watchedAddress.replace(/[^a-zA-Z]/g, '').toUpperCase();

    for (const entry of lookupRules) {
      if (entry.ids.includes(cleaned)) {
        form.setValue('neighborhood', entry.value);
        break;
      }
    }
  }, [form, watchedAddress]);

  function onSubmit(values: FormValues) {
    const token = localStorage.getItem('token');
    const { deliveryTimeFormatted, dayOrNight } = formatDeliveryTime(
      values.deliveryTime || '',
    );

    fetch(buildApiUrl('/api/delivery/add'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
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
    }).then((res) => {
      if (res.status === 200) {
        toast.success('Delivery added successfully');
        form.reset();
      } else {
        toast.error(`Failed to add delivery: ${res.statusText}`);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-1 pb-10 sm:px-0">
      <div className="mb-6 rounded-2xl border border-sky-200/70 bg-linear-to-r from-cyan-50 via-sky-50 to-blue-100 p-5 sm:p-6">
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Add Delivery
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 sm:text-base">
          Add all customer information to save the delivery.
        </p>
      </div>

      <Card className="overflow-hidden border-sky-100 bg-white/85 shadow-lg shadow-sky-900/5">
        <CardHeader className="border-b border-slate-200/70 bg-slate-50/70">
          <CardTitle className="text-xl text-slate-900">Delivery Form</CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Required fields are validated before a delivery can be saved.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <section className={formSectionClassName}>
                <div className="mb-4">
                  <h2 className={sectionTitleClassName}>
                    <UserRound className="h-4 w-4 text-sky-700" />
                    Customer
                  </h2>
                  <p className={sectionDescriptionClassName}>
                    Primary contact and phone details.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(000) 000-0000"
                            {...field}
                            className={formInputClassName}
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(formatPhoneNumber(e.target.value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className={formSectionClassName}>
                <div className="mb-4">
                  <h2 className={sectionTitleClassName}>
                    <MapPinHouse className="h-4 w-4 text-sky-700" />
                    Location
                  </h2>
                  <p className={sectionDescriptionClassName}>
                    Delivery destination and neighborhood mapping.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
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
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger
                              className={`w-full ${formInputClassName}`}
                            >
                              <SelectValue placeholder="Select neighborhood..." />
                            </SelectTrigger>
                            <SelectContent>
                              {neighborhoodOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
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
              </section>

              <section className={formSectionClassName}>
                <div className="mb-4">
                  <h2 className={sectionTitleClassName}>
                    <CalendarDays className="h-4 w-4 text-sky-700" />
                    Schedule and Billing
                  </h2>
                  <p className={sectionDescriptionClassName}>
                    Set date range, drop-off time, and gratuity.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
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
                        <FormLabel>End Date</FormLabel>
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
                        <FormLabel>Delivery Time</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="tip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tip ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            {...field}
                            className={formInputClassName}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className={formSectionClassName}>
                <div className="mb-4">
                  <h2 className={sectionTitleClassName}>
                    <PackagePlus className="h-4 w-4 text-sky-700" />
                    Cooler Setup
                  </h2>
                  <p className={sectionDescriptionClassName}>
                    Cooler size, type, and quantity.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="coolerSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cooler Size</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger
                              className={`w-full ${formInputClassName}`}
                            >
                              <SelectValue placeholder="Select cooler size..." />
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
                        <FormLabel>Ice Type</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger
                              className={`w-full ${formInputClassName}`}
                            >
                              <SelectValue placeholder="Select ice type..." />
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
                        <FormLabel>Number of Coolers</FormLabel>
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
                </div>
              </section>

              <section className={formSectionClassName}>
                <div className="mb-4">
                  <h2 className={sectionTitleClassName}>
                    <GlassWater className="h-4 w-4 text-sky-700" />
                    Extras
                  </h2>
                  <p className={sectionDescriptionClassName}>
                    Optional add-ons and party supplies.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
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
              </section>

              <section className={formSectionClassName}>
                <div className="mb-4">
                  <h2 className={sectionTitleClassName}>Final Notes</h2>
                  <p className={sectionDescriptionClassName}>
                    Add an email and any delivery instructions.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="example@gmail.com"
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
                    name="specialInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., leave by back door"
                            {...field}
                            className={formInputClassName}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <div className="flex flex-col justify-end gap-3 border-t border-slate-200 pt-4 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Save Delivery
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddDelivery;
