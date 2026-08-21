import type { Team } from '../types'

/**
 * IPL-style preset teams. Logos reference locally generated crest assets.
 * This is an unofficial fan project — no affiliation with the IPL or any franchise.
 */
export interface PresetTeamDef {
  id: string
  name: string
  shortName: string
  primaryColor: string
  secondaryColor: string
  budget: number // lakh
}

export const IPL_PRESET_TEAMS: PresetTeamDef[] = [
  {
    id: 'mi',
    name: 'Mumbai Indians',
    shortName: 'MI',
    primaryColor: '#045093',
    secondaryColor: '#d1ab3e',
    budget: 12000,
  },
  {
    id: 'csk',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    primaryColor: '#f9cd05',
    secondaryColor: '#005db8',
    budget: 12000,
  },
  {
    id: 'rcb',
    name: 'Royal Challengers Bengaluru',
    shortName: 'RCB',
    primaryColor: '#d5152b',
    secondaryColor: '#211a1c',
    budget: 12000,
  },
  {
    id: 'kkr',
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    primaryColor: '#3a225d',
    secondaryColor: '#f0bc42',
    budget: 12000,
  },
  {
    id: 'dc',
    name: 'Delhi Capitals',
    shortName: 'DC',
    primaryColor: '#17449b',
    secondaryColor: '#ef1b23',
    budget: 12000,
  },
  {
    id: 'rr',
    name: 'Rajasthan Royals',
    shortName: 'RR',
    primaryColor: '#ea1a85',
    secondaryColor: '#124b9b',
    budget: 12000,
  },
  {
    id: 'pbks',
    name: 'Punjab Kings',
    shortName: 'PBKS',
    primaryColor: '#dd1f2d',
    secondaryColor: '#a7a9ac',
    budget: 11000,
  },
  {
    id: 'srh',
    name: 'Sunrisers Hyderabad',
    shortName: 'SRH',
    primaryColor: '#f26522',
    secondaryColor: '#000000',
    budget: 11000,
  },
  {
    id: 'gt',
    name: 'Gujarat Titans',
    shortName: 'GT',
    primaryColor: '#1b2133',
    secondaryColor: '#b4945a',
    budget: 11000,
  },
  {
    id: 'lsg',
    name: 'Lucknow Super Giants',
    shortName: 'LSG',
    primaryColor: '#005baa',
    secondaryColor: '#f78d1e',
    budget: 11000,
  },
]

export function presetTeamLogoPath(id: string): string {
  return `/assets/teams/${id}.svg`
}

export function buildPresetTeams(
  controllerTeamId: string | null,
  aiProfileFactory: (index: number) => Team['aiProfile'],
): Team[] {
  return IPL_PRESET_TEAMS.map((def, index) => ({
    id: def.id,
    name: def.name,
    shortName: def.shortName,
    logo: presetTeamLogoPath(def.id),
    primaryColor: def.primaryColor,
    secondaryColor: def.secondaryColor,
    budget: def.budget,
    purse: def.budget,
    controller: def.id === controllerTeamId ? 'user' : 'ai',
    aiProfile: aiProfileFactory(index),
  }))
}
