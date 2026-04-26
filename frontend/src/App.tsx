import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamsPage } from "@/pages/teams"
import { PlayersPage } from "@/pages/players"
import { AnalyticsPage } from "@/pages/analytics"

export function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Madden NFL Salary Explorer</h1>
              <p className="text-sm text-muted-foreground">Browse team and player salary cap information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="mt-8">
            <TeamsPage />
          </TabsContent>

          <TabsContent value="players" className="mt-8">
            <PlayersPage />
          </TabsContent>

          <TabsContent value="analytics" className="mt-8">
            <AnalyticsPage />
          </TabsContent>
        </Tabs>
      </div>

      <div className="border-t bg-muted/50 py-6 text-center text-sm text-muted-foreground mt-12">
        <p>Madden NFL Salary Explorer • eli stowers is a fraud</p>
      </div>
    </div>
  )
}

export default App
