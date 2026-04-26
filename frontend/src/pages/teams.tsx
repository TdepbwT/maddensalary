import { useState } from "react"
import { getAllTeams, searchTeams, Team, formatCurrency, formatCapPercentage } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { CapBreakdownChart } from "@/components/charts/cap-breakdown-chart"

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setHasSearched(true)
    try {
      if (searchQuery.trim().length >= 2) {
        const results = await searchTeams(searchQuery)
        setTeams(results)
      } else {
        const results = await getAllTeams()
        setTeams(results)
      }
    } catch (error) {
      console.error("Error searching teams:", error)
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  const handleLoadAll = async () => {
    setLoading(true)
    setSearchQuery("")
    setHasSearched(true)
    try {
      const results = await getAllTeams()
      setTeams(results)
    } catch (error) {
      console.error("Error loading teams:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teams</h1>
        <p className="text-muted-foreground">View NFL team salary cap information</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search teams by name or abbreviation (e.g., 'Chiefs', '49ers')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
        <Button type="button" variant="outline" onClick={handleLoadAll} disabled={loading}>
          Show All
        </Button>
      </form>

      {loading && <Spinner className="h-32" />}

      {!loading && hasSearched && teams.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No teams found. Try a different search.</p>
          </CardContent>
        </Card>
      )}

      {!loading && teams.length > 0 && (
        <div className="space-y-8">
          <p className="mb-4 text-sm text-muted-foreground">
            Found {teams.length} team{teams.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div key={team.teamId}>
                <Card 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setExpandedTeamId(expandedTeamId === String(team.teamId) ? null : String(team.teamId))}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{team.teamName}</CardTitle>
                        <CardDescription>{team.abbrName}</CardDescription>
                      </div>
                      <span className="text-2xl">{expandedTeamId === String(team.teamId) ? "−" : "+"}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cap Available</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(team.salary.capAvailable)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cap Spent</span>
                        <span className="font-semibold">{formatCurrency(team.salary.capSpent)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cap Room</span>
                        <span className="font-semibold">{formatCurrency(team.salary.capRoom)}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Utilization</span>
                          <span className="font-semibold">
                            {formatCapPercentage(team.salary.capSpent, team.salary.capRoom + team.salary.capSpent)}
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all"
                            style={{
                              width: `${
                                (team.salary.capSpent / (team.salary.capRoom + team.salary.capSpent)) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {expandedTeamId === String(team.teamId) && (
                  <div className="mt-4">
                    <CapBreakdownChart
                      teamName={team.teamName}
                      capSpent={team.salary.capSpent}
                      capAvailable={team.salary.capAvailable}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
