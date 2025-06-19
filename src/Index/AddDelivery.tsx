import '../App.css';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  sectionA,
  sectionB,
  sectionC,
  sectionD,
  sectionE,
  sectionF,
  hijo,
  klmpq,
  crownPoint,
  spinDrift,
  pineIsland,
  buckIsland,
  oceanHill,
  corollaLight,
  cruzBay,
  whalehead,
  whaleheadRight,
  monterayShores,
  currituckClub,
} from '@/components/constants/neighborhoods';
import { useEffect } from 'react';
import { toast } from 'sonner';

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

function AddDelivery() {
  const form = useForm<z.infer<typeof formSchema>>({
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
      tip: '0',
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    const token = localStorage.getItem('token');

    let deliveryTimeFormatted = values.deliveryTime || '';
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

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    fetch(`${API_BASE_URL}/api/delivery/add`, {
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
    }).then((res) => {
      if (res.status === 200) {
        toast.success('Delivery added successfully');
        form.reset(); // clear form
      } else {
        toast.error(`Failed to add delivery: ${res.statusText}`);
      }
    });
  }

  useEffect(() => {
    const rawAddress = form.watch('deliveryAddress') || '';
    const cleaned = rawAddress.replace(/[^a-zA-Z]/g, '').toUpperCase();

    const inList = (list: string[]) => list.includes(cleaned);

    const lookup = [
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
    ];

    for (const entry of lookup) {
      if (inList(entry.ids)) {
        form.setValue('neighborhood', entry.value);
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch('deliveryAddress')]);

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

  return (
    <Card className="m-4 p-4">
      <CardHeader className="flex flex-col items-start p-0">
        <CardTitle className="text-2xl">🧊 Add Delivery</CardTitle>
        <CardDescription>Add new delivery information</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Customer Info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Pat Lewis" {...field} />
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
                      value={field.value}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
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
                      <SelectTrigger className="w-full">
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
          </div>

          {/* Dates & Time */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
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
                    <Input type="number" step="0.01" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Cooler Info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="coolerSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cooler Size</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
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
                      <SelectTrigger className="w-full">
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
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Extras */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {['limes', 'lemons', 'oranges', 'margSalt', 'freezePops'].map(
              (fieldKey) => (
                <FormField
                  key={fieldKey}
                  control={form.control}
                  name={fieldKey as keyof z.output<typeof formSchema>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">{fieldKey}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0"
                          {...field}
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

          {/* Contact + Notes */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@gmail.com" {...field} />
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
                    <Input placeholder="e.g., leave by back door" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">
            <Button type="submit" className="w-full md:w-auto">
              Save Delivery
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

export default AddDelivery;
