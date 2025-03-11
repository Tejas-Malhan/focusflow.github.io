
import { Card } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";

export default function Index() {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Here's an overview of your productivity today.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <h3 className="font-semibold">Focus Time</h3>
            <p className="mt-2 text-3xl font-bold">2h 30m</p>
            <p className="text-sm text-muted-foreground">Today's total focus time</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold">Tasks</h3>
            <p className="mt-2 text-3xl font-bold">5/8</p>
            <p className="text-sm text-muted-foreground">Tasks completed today</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold">Calendar</h3>
            <p className="mt-2 text-3xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">Upcoming events today</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
