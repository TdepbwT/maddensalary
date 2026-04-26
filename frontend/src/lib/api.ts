import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export interface Team {
  teamId: number
  teamName: string
  abbrName: string
  salary: {
    capRoom: number
    capSpent: number
    capAvailable: number
  }
}

export interface Player {
  playerId: number
  firstName: string
  lastName: string
  position: string
  salary: {
    contractSalary: number
    capHit: number
    contractBonus: number
    contractLength: number
    contractYearsLeft: number
    capReleasePenalty: number
    capReleaseNetSavings: number
  }
  status: {
    isActive: boolean
    isOnIR: boolean
    isFreeAgent: boolean
    isOnPracticeSquad: boolean
  }
}

// Team endpoints
export async function getAllTeams(): Promise<Team[]> {
  const response = await API.get("/teams/salary")
  // API returns a dict {teamId: {...}}, convert to array
  return Object.entries(response.data).map(([teamId, team]) => ({
    teamId: parseInt(teamId),
    ...team as Omit<Team, 'teamId'>,
  }))
}

export async function searchTeams(name: string): Promise<Team[]> {
  const response = await API.get("/teams/search", { params: { name } })
  // API returns {searchTerm, resultsFound, teams: [...]}
  return response.data.teams.map((team: any) => ({
    teamId: parseInt(team.teamId),
    ...team,
  }))
}

export async function getTeamById(teamId: number): Promise<Team> {
  const response = await API.get(`/teams/${teamId}/salary`)
  return response.data
}

export async function getTeamPlayers(teamId: number): Promise<Player[]> {
  const response = await API.get(`/teams/${teamId}/players/salary`)
  // API returns {teamId, totalPlayers, players: {...}}, convert players object to array
  const players = response.data.players
  return Object.entries(players).map(([playerId, player]) => ({
    playerId: parseInt(playerId),
    ...player as Omit<Player, 'playerId'>,
  }))
}

// Player endpoints
export async function searchPlayers(name: string): Promise<Player[]> {
  const response = await API.get("/players/search", { params: { name } })
  return response.data.players
}

export async function getPlayerById(playerId: number): Promise<Player> {
  const response = await API.get(`/players/${playerId}/salary`)
  return response.data
}

// Helper functions
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCapPercentage(spent: number, total: number): string {
  const percentage = (spent / total) * 100
  return `${percentage.toFixed(1)}%`
}
