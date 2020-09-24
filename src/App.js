import React, { useEffect, useRef, useState } from 'react';
import {
  ReferenceDot,
  ReferenceLine,
  ReferenceArea,
  ScatterChart,
  Scatter,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import NewPitch from './Components/NewPitch'



function App() {
  const [matches, setMatches] = useState([]);
  const [details, setDetails] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);

  const fetchMatches = async() => {
    const result = await fetch('http://127.0.0.1:8000/api/match',
      { 
        method: 'GET',
      }
    )
    const json = await result.json()
    setMatches(json)
  }

  const fetchDetails = async (id) => {
    setDetails(null)
    setTeamDetails(null)
    const result = await fetch(`http://127.0.0.1:8000/api/match/${id}`);
    const json = await result.json()
    const { home_team, away_team } = json;
    const teamA = await fetch(`http://127.0.0.1:8000/api/team/${home_team}`)
    const teamB = await fetch(`http://127.0.0.1:8000/api/team/${away_team}`)
    const teamAJson = await teamA.json()
    const teamBJson = await teamB.json()
    setDetails(json)
    setTeamDetails({ [home_team]: teamAJson, [away_team]: teamBJson })   
  }

  useEffect(() => {
    fetchMatches();
  }, [])

  return (
    <div className="container">
      <h1>
        Football statistics
      </h1>
      <div className="match_container">
          {matches && matches.map((match, index) => ( 
            <div className="match" key={index} onClick={() => fetchDetails(match.id)}>
              <div className="match_home-team">
                <h1>{match.home_team_name}</h1>
              </div>
              <div className="match_score">
                <p>{match.home_score}</p>
                <p>:</p>
                <p>{match.away_score}</p>
              </div>
              <div className="match_away-team">
                <h1>{match.away_team_name}</h1>
              </div>
            </div>)
          )}
        </div>
      {details && teamDetails && <NewPitch details={details} teamDetails={teamDetails}/>}
    </div>
  )
}

export default App;
