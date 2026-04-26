import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TeamScatterData {
  name: string
  capSpent: number
  capRoom: number
  capAvailable: number
}

interface CapScatterProps {
  teams: TeamScatterData[]
}

export function CapScatterChart({ teams }: CapScatterProps) {
  const data = teams.map((team) => ({
    name: team.name,
    x: team.capSpent / 1000000,
    y: team.capAvailable / 1000000,
    utilization: ((team.capSpent / (team.capSpent + team.capAvailable)) * 100).toFixed(1),
  }))

  const getColor = (utilization: string) => {
    const util = parseFloat(utilization)
    if (util > 49) return '#ef4444'
    if (util > 47) return '#f97316'
    if (util > 45) return '#eab308'
    return '#22c55e'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cap Spent vs Available</CardTitle>
        <CardDescription>Each dot represents a team - bubble size shows utilization percentage</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              label={{ value: 'Cap Spent ($M)', position: 'right', offset: 10 }}
            />
            <YAxis
              dataKey="y"
              type="number"
              label={{ value: 'Available Cap ($M)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg bg-black/75 p-3 text-white">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm">Spent: ${data.x.toFixed(1)}M</p>
                      <p className="text-sm">Available: ${data.y.toFixed(1)}M</p>
                      <p className="text-sm font-semibold">Utilization: {data.utilization}%</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Scatter
              name="Teams"
              data={data}
              fill="#8884d8"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.utilization)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
