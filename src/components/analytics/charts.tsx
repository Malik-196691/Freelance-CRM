"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"

interface RevenueChartProps {
  data: Array<{
    month: string
    revenue: number
    paid: number
  }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total Revenue" />
            <Bar dataKey="paid" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Paid" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface ProjectStatusChartProps {
  data: {
    active: number
    completed: number
    on_hold: number
    archived: number
  }
}

const COLORS = {
  active: '#10b981',
  completed: '#3b82f6',
  on_hold: '#f59e0b',
  archived: '#6b7280',
}

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  const chartData = [
    { name: 'Active', value: data.active, color: COLORS.active },
    { name: 'Completed', value: data.completed, color: COLORS.completed },
    { name: 'On Hold', value: data.on_hold, color: COLORS.on_hold },
    { name: 'Archived', value: data.archived, color: COLORS.archived },
  ].filter(item => item.value > 0)

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Project Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
