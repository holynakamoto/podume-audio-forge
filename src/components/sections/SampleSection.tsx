
import { Play, Rewind, FastForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SampleSection = () => {
  return (
    <section id="sample" className="py-20 md:py-32 bg-card/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Hear The Difference</h2>
          <p className="text-lg text-muted-foreground mb-16">
            Listen to a sample episode generated from a real resume. This could be you.
          </p>
        </div>
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-8 shadow-2xl shadow-primary/10">
          <div className="flex items-center gap-6">
            <img src="/placeholder.svg" alt="Podcast Cover" className="w-24 h-24 rounded-lg bg-muted" />
            <div className="flex-1">
              <h3 className="text-xl font-bold">From Barista to Marketing Pro</h3>
              <p className="text-muted-foreground">John Doe's Career Journey</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-1/3"></div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>1:34</span>
              <span>5:22</span>
            </div>
          </div>
          <div className="flex justify-center items-center gap-4 mt-4">
            <Button variant="ghost" size="icon"><Rewind className="h-6 w-6" /></Button>
            <Button variant="default" size="lg" className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90">
              <Play className="h-8 w-8 text-primary-foreground fill-primary-foreground" />
            </Button>
            <Button variant="ghost" size="icon"><FastForward className="h-6 w-6" /></Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SampleSection
