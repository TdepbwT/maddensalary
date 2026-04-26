import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TeamRankData {
  rank: number
  name: string
  capAvailable: number
  utilization: number
}

interface CapDistributionProps {
  teams: TeamRankData[]
}

export function CapDistribution({ teams }: CapDistributionProps) {
  const sortedTeams = [...teams]
    .sort((a, b) => b.capAvailable - a.capAvailable)
    .map((team, index) => ({
      ...team,
      rank: index + 1,
      available: team.capAvailable / 1000000,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cap Availability Ranking</CardTitle>
        <CardDescription>All 32 teams ranked by available cap space</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={sortedTeams} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="rank"
              label={{ value: 'Team Rank (by available cap)', position: 'bottom', offset: 10 }}
            />
            <YAxis
              label={{ value: 'Available Cap ($M)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value) => `$${Number(value).toFixed(1)}M`}
              labelFormatter={(label) => `Rank #${label}`}
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: '8px' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="available"
              stroke="#8b5cf6"
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Available Cap ($M)"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
