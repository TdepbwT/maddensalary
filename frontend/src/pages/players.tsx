import { useState } from "react"
import { searchPlayers, Player, formatCurrency } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length < 2) return

    setLoading(true)
    setHasSearched(true)
    try {
      const results = await searchPlayers(searchQuery)
      setPlayers(results)
    } catch (error) {
      console.error("Error searching players:", error)
      setPlayers([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Players</h1>
        <p className="text-muted-foreground">Search for players by name to view salary information</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search players by first or last name (e.g., 'Mahomes', 'Smith')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || searchQuery.trim().length < 2}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {loading && <Spinner className="h-32" />}

      {!loading && hasSearched && players.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No players found. Try a different search.</p>
          </CardContent>
        </Card>
      )}

      {!loading && players.length > 0 && (
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            Found {players.length} player{players.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-4">
            {players.map((player) => (
              <Card key={player.playerId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {player.firstName} {player.lastName}
                      </CardTitle>
                      <CardDescription>{player.position}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {player.status.isActive && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Active
                        </span>
                      )}
                      {player.status.isOnIR && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                          IR
                        </span>
                      )}
                      {player.status.isFreeAgent && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                          FA
                        </span>
                      )}
                      {player.status.isOnPracticeSquad && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          PS
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Contract Salary</p>
                      <p className="font-semibold">{formatCurrency(player.salary.contractSalary)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cap Hit</p>
                      <p className="font-semibold text-blue-600">{formatCurrency(player.salary.capHit)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contract Bonus</p>
                      <p className="font-semibold">{formatCurrency(player.salary.contractBonus)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Years Remaining</p>
                      <p className="font-semibold">{player.salary.contractYearsLeft}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contract Length</p>
                      <p className="font-semibold">{player.salary.contractLength} years</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Release Penalty</p>
                      <p className="font-semibold text-red-600">{formatCurrency(player.salary.capReleasePenalty)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Release Savings</p>
                      <p className="font-semibold text-green-600">{formatCurrency(player.salary.capReleaseNetSavings)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
