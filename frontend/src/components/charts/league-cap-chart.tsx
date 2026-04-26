import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TeamCapData {
  name: string
  capAvailable: number
  capSpent: number
}

interface LeagueCapChartProps {
  teams: TeamCapData[]
  title?: string
}

export function LeagueCapChart({ teams, title = 'League-Wide Cap Utilization' }: LeagueCapChartProps) {
  const sortedTeams = [...teams]
    .sort((a, b) => b.capAvailable - a.capAvailable)
    .slice(0, 16) // Show top 16

  const data = sortedTeams.map((team) => ({
    name: team.name,
    'Available': team.capAvailable / 1000000,
    'Spent': team.capSpent / 1000000,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Sorted by available cap space</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis label={{ value: 'Cap ($M)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              formatter={(value) => `$${Number(value).toFixed(1)}M`}
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="Available" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Spent" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
