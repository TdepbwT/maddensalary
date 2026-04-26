import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CapBreakdownChartProps {
  capSpent: number
  capAvailable: number
  teamName: string
}

export function CapBreakdownChart({ capSpent, capAvailable, teamName }: CapBreakdownChartProps) {
  const data = [
    { name: 'Cap Spent', value: capSpent },
    { name: 'Cap Available', value: capAvailable },
  ]

  const COLORS = ['#3b82f6', '#10b981']

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{teamName} Cap Breakdown</CardTitle>
        <CardDescription>Spent vs Available Cap Space</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: $${(value / 1000000).toFixed(1)}M`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `$${(Number(value) / 1000000).toFixed(1)}M`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
