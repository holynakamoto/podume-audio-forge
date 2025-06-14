
import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadCloud, Loader2, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  resume: z.any().refine(files => files?.length > 0, 'Resume is required.'),
  package: z.enum(['core', 'upsell'], { required_error: 'You need to select a package.' }),
  voice_clone: z.boolean().default(false),
  premium_assets: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const prices = {
  core: 99,
  upsell: 199,
  voice_clone: 29,
  premium_assets: 19,
};

export function ResumeForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, control, formState: { errors, isValid } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      package: 'core',
      voice_clone: false,
      premium_assets: false,
    },
    mode: 'onChange'
  });

  const watchedValues = watch();

  const total = useMemo(() => {
    let total = prices[watchedValues.package as keyof typeof prices] || 0;
    if (watchedValues.voice_clone) total += prices.voice_clone;
    if (watchedValues.premium_assets) total += prices.premium_assets;
    return total;
  }, [watchedValues]);

  const onSubmit = (data: FormValues) => {
    console.log(data);
    toast.info("Processing your order...", { duration: 3000 });
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 3000);
  };

  if (step === 3) {
    return (
        <Card className="w-full max-w-2xl mx-auto text-center animate-fade-in">
            <CardHeader>
                <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
                    <PartyPopper className="h-12 w-12 text-green-500" />
                </div>
                <CardTitle className="text-3xl">Success!</CardTitle>
                <CardDescription className="text-lg">Your podcast is being generated.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">We've received your resume and order details. You'll receive an email with your podcast episode and social assets within the next 15 minutes. We can't wait for you to hear it!</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Podcast</CardTitle>
        <CardDescription>Step {step} of 2: Upload your resume and choose your options.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <Label htmlFor="resume-upload" className="font-semibold text-lg">Upload Your Resume</Label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border px-6 py-10">
                    <div className="text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4 flex text-sm leading-6 text-gray-400">
                            <label htmlFor="resume-upload" className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80">
                                <span>Upload a file</span>
                                <Input id="resume-upload" type="file" className="sr-only" {...register('resume')} accept=".pdf,.doc,.docx" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-400">PDF, DOC, DOCX up to 10MB</p>
                    </div>
                </div>
                {errors.resume && <p className="text-red-500 text-sm mt-2">{errors.resume.message?.toString()}</p>}
                {watchedValues.resume?.[0] && <p className="text-green-500 text-sm mt-2">File selected: {watchedValues.resume[0].name}</p>}
              </div>

              <Button type="button" onClick={() => setStep(2)} className="w-full text-lg py-6" disabled={!watchedValues.resume || watchedValues.resume.length === 0}>
                Next: Choose Package
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <Label className="font-semibold text-lg">Select Your Package</Label>
                    <Controller
                        control={control}
                        name="package"
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Label htmlFor="core" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <RadioGroupItem value="core" id="core" className="sr-only" />
                                    <span className="font-bold text-xl">Core Package</span>
                                    <span className="font-extrabold text-3xl mt-2 mb-4">${prices.core}</span>
                                    <span className="text-sm text-muted-foreground">One 5-10 min episode</span>
                                </Label>
                                <Label htmlFor="upsell" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <RadioGroupItem value="upsell" id="upsell" className="sr-only" />
                                    <span className="font-bold text-xl">Upsell Package</span>
                                    <span className="font-extrabold text-3xl mt-2 mb-4">${prices.upsell}</span>
                                    <span className="text-sm text-muted-foreground">3-episode series or video</span>
                                </Label>
                            </RadioGroup>
                        )}
                    />
                </div>
                
                <div>
                    <Label className="font-semibold text-lg">Optional Add-ons</Label>
                    <div className="mt-2 space-y-4">
                        <div className="flex items-center space-x-3 rounded-md border p-4">
                            <Checkbox id="voice_clone" {...register('voice_clone')} />
                            <label htmlFor="voice_clone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow cursor-pointer">
                                Custom AI Voice Cloning
                            </label>
                            <span className="text-primary font-bold">+${prices.voice_clone}</span>
                        </div>
                         <div className="flex items-center space-x-3 rounded-md border p-4">
                            <Checkbox id="premium_assets" {...register('premium_assets')} />
                            <label htmlFor="premium_assets" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow cursor-pointer">
                                Premium Social Assets
                            </label>
                            <span className="text-primary font-bold">+${prices.premium_assets}</span>
                        </div>
                    </div>
                </div>

                <Card className="bg-muted/50">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">Total</span>
                            <span className="text-3xl font-extrabold text-primary">${total}</span>
                        </div>
                    </CardContent>
                </Card>

              <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full text-lg py-6">
                    Back
                  </Button>
                  <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Proceed to Checkout'}
                  </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
