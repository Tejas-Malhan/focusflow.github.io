
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";

export default function Calendar() {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage your schedule.
          </p>
        </div>

        <Card className="p-6 h-[600px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Google Calendar integration coming soon...
          </p>
        </Card>
      </div>
    </Layout>
  );
}
