import { useState, useEffect } from 'react'
import { getAllTeams, Team } from '@/lib/api'
import { LeagueCapChart } from '@/components/charts/league-cap-chart'
import { CapDistribution } from '@/components/charts/cap-distribution'
import { CapScatterChart } from '@/components/charts/cap-scatter-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export function AnalyticsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCapRoom: 0,
    totalCapSpent: 0,
    avgUtilization: 0,
    highestAvailableCap: 0,
    lowestAvailableCap: 0,
  })

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = await getAllTeams()
        setTeams(data)

        // Calculate stats
        const totalCapRoom = data.reduce((sum, t) => sum + t.salary.capRoom, 0)
        const totalCapSpent = data.reduce((sum, t) => sum + t.salary.capSpent, 0)
        const avgUtilization = (totalCapSpent / (totalCapSpent + totalCapRoom)) * 100

        const capAvailable = data.map((t) => t.salary.capAvailable)
        const highestAvailableCap = Math.max(...capAvailable)
        const lowestAvailableCap = Math.min(...capAvailable)

        setStats({
          totalCapRoom,
          totalCapSpent,
          avgUtilization,
          highestAvailableCap,
          lowestAvailableCap,
        })
      } catch (error) {
        console.error('Error loading teams:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTeams()
  }, [])

  if (loading) {
    return <Spinner className="h-32" />
  }

  const chartTeams = teams.map((team) => ({
    name: team.abbrName,
    capAvailable: team.salary.capAvailable,
    capSpent: team.salary.capSpent,
  }))

  const scatterTeams = teams.map((team) => ({
    name: team.teamName,
    capSpent: team.salary.capSpent,
    capRoom: team.salary.capRoom,
    capAvailable: team.salary.capAvailable,
  }))

  const rankTeams = teams.map((team) => ({
    rank: 0,
    name: team.abbrName,
    capAvailable: team.salary.capAvailable,
    utilization: (team.salary.capSpent / (team.salary.capSpent + team.salary.capRoom)) * 100,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">League Analytics</h1>
        <p className="text-muted-foreground">Salary cap insights across all 32 NFL teams</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Cap Room</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalCapRoom / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">League-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Cap Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalCapSpent / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">League-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">All 32 teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Highest Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.highestAvailableCap / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">Single team</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Lowest Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.lowestAvailableCap / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">Single team</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LeagueCapChart teams={chartTeams} />
        <CapScatterChart teams={scatterTeams} />
      </div>

      <CapDistribution teams={rankTeams} />
    </div>
  )
}
