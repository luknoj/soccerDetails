import React, { useRef, useEffect, useState } from 'react';

const NewPitch = ({ details, teamDetails }) => {
  const [sections, setSections] = useState({ rows: 5, columns: 5 })
  const [showShotsSection, setShootsSection] = useState(false);
  const [showPassesSection, setPassesSection] = useState(false);
  const [selectedTeam, setSelectedTeam] =  useState('all');
  const [isSectionShowed, setShowedSection] = useState({ goals: false, shoots: false, passes: false })
  // const [ details]
  const canvas = useRef(null);
  const scale = 8;
  const canvasWidth = 105 * scale;
  const canvasHeight = 70 * scale;

  const tileWidth = Math.round(canvasWidth / sections.columns);
  const tileHeight = Math.round(canvasHeight / sections.rows);
  let ctx = null;
  let rectangles = []

  
  const draw = () => {
    for(let i = 0; i < sections.rows; i++) {
      for(let j = 0; j < sections.columns; j++) {
        // drawFillRect(i * tileWidth, j * tileHeight, i*j)
        rectangles.push({ x: i * tileWidth, y: j * tileHeight })
      }
    }
  }

  useEffect(() => {
    const canvasElement = canvas.current
    ctx = canvasElement.getContext("2d"); 

    draw()
  }, [draw])

  useEffect(() => {
    const canvasEl = canvas.current.getBoundingClientRect()
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
  }, [details])
  

  const drawFillRect = (x, y, opacity) => {
    const backgroundColor = 'black';

    ctx.beginPath();
    ctx.fillStyle = `rgba(0, 0, 0, .05)`;
    // ctx.fillStyle = 'blue';
    ctx.strokeStyle = 'black';
    ctx.rect(x, y, tileWidth, tileHeight);
    ctx.fill()
    ctx.stroke()
  }

  const calculateAreaData = (x, y) => {
    const shots = details.shots.filter(detail => {
      const posX = detail.position_x * canvasWidth
      const posY = detail.position_y * canvasHeight
      if (selectedTeam === 'all') {
        return posX >= x && posX <= x + tileWidth && posY >= y && posY <= y + tileHeight
      } else {
        return posX >= x && posX <= x + tileWidth && posY >= y && posY <= y + tileHeight && detail.team === Number(selectedTeam)
      }
    });
    const passes = details.passes.filter(detail => {
      const posX = detail.position_x * canvasWidth
      const posY = detail.position_y * canvasHeight

      if (selectedTeam === 'all') {
        return posX >= x && posX <= x + tileWidth && posY >= y && posY <= y + tileHeight
      } else {
        return posX >= x && posX <= x + tileWidth && posY >= y && posY <= y + tileHeight && detail.team === Number(selectedTeam)
      }
    })

    return { passes, shots }
  }

  const handleMouseMove = (e) => {
    let canvasEl = canvas.current.getBoundingClientRect(),
      x = e.clientX - canvasEl.left,
      y = e.clientY - canvasEl.top,
      i = 0, r;

      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

      while(r = rectangles[i++]) {
        ctx.beginPath();
        ctx.rect(r.x, r.y, tileWidth, tileHeight);
        ctx.fillStyle = ctx.isPointInPath(x, y) ? `rgba(0, 0, 0, .25)`: `rgba(0, 0, 0, .05)`;
        ctx.strokeStyle = 'black';
        ctx.stroke()
        ctx.fill();
      }
  }
  
  const handleMouseClick = (e) => {
    let canvasEl = canvas.current.getBoundingClientRect(),
        x = e.clientX - canvasEl.left,
        y = e.clientY - canvasEl.top,
        i = 0, r;
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
  
        while(r = rectangles[i++]) {
          ctx.beginPath();
          ctx.rect(r.x, r.y, tileWidth, tileHeight);
          ctx.fillStyle = ctx.isPointInPath(x, y) ? `rgba(0, 0, 0, .25)`: `rgba(0, 0, 0, .05)`;
          ctx.strokeStyle = 'black';
          ctx.stroke()
          ctx.fill();
  
          if (ctx.isPointInPath(x, y)) {
            const { shots, passes } = calculateAreaData(r.x, r.y);
            shots.forEach(detail => {
              const x = detail.position_x * canvasWidth
              const y = detail.position_y * canvasHeight
              ctx.beginPath();
              ctx.arc(x, y, 10, 0, 2 * Math.PI, true);
              ctx.fillStyle = detail.on_target ? detail.is_goal ? 'green' : 'yellow' : 'red';
              ctx.fill();
            })
            passes.forEach(detail => {
              const x = detail.position_x * canvasWidth
              const y = detail.position_y * canvasHeight
              ctx.beginPath();
              ctx.arc(x, y, 10, 0, 2 * Math.PI, true);
              ctx.fillStyle = 'blue';
              ctx.fill();
            })
          }
        }
    }

  const sectionColor = (shoots, { r, g, b}, detail, detail2) => {
    const allShoots = details[detail].filter(shot => detail2 ? shot[detail2] : shot).length;
    const percentage = (shoots / allShoots) * 1.5
    return { color:`rgba(${r}, ${g}, ${b}, ${percentage})`, percentage }
  }

  const handleGoalsPercente = (selectedPlayer) => {
    let canvasEl = canvas.current.getBoundingClientRect();
    if (isSectionShowed.goals) {
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    } else {
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
      for (let index = 0; index < rectangles.length; index++) {
        const { shots } = calculateAreaData(rectangles[index].x, rectangles[index].y);
        ctx.beginPath();
        ctx.rect(rectangles[index].x, rectangles[index].y, tileWidth, tileHeight);
        const { color, percentage } = sectionColor(shots.length, { r: 255, g: 255, b: 0 }, 'shots', 'on_target')
        ctx.fillStyle = color;
        ctx.fill();
        shots.forEach(detail => {
          if(detail.is_goal) {
            const x = detail.position_x * canvasWidth
            const y = detail.position_y * canvasHeight
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI, true);
            ctx.fillStyle = Number(detail.team) === Number(details.away_team) ? 'purple' : 'black';
            ctx.fill();
          }
        })
      }
    }

    setShowedSection(prevState => ({ goals: !prevState.goals, shoots: false, passes: false }))
  }

  const handleShotsPercente = (selectedPlayer) => {
    let canvasEl = canvas.current.getBoundingClientRect();
    if (isSectionShowed.shots) {
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    } else {
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
      for (let index = 0; index < rectangles.length; index++) {
        const { shots } = calculateAreaData(rectangles[index].x, rectangles[index].y);
        ctx.beginPath();
        ctx.rect(rectangles[index].x, rectangles[index].y, tileWidth, tileHeight);
        const { color, percentage } = sectionColor(shots.length, { r: 255, g: 0, b: 0 }, 'shots', 'on_target')
        ctx.fillStyle = color;
        ctx.fill();
        shots.forEach(detail => {
            const x = detail.position_x * canvasWidth
            const y = detail.position_y * canvasHeight
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI, true);
            ctx.fillStyle = Number(detail.team) === Number(details.away_team) ? 'purple' : 'black';
            ctx.fill();
        })
      }
    }

    
    setShowedSection(prevState => ({ goals: false, shoots: !prevState.shots, passes: false }))
  }

  const handlePassesPercente = (selectedPlayer) => {
    let canvasEl = canvas.current.getBoundingClientRect();
    if (isSectionShowed.passes) {
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    } else {
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
      for (let index = 0; index < rectangles.length; index++) {
        const { passes } = calculateAreaData(rectangles[index].x, rectangles[index].y);
        ctx.beginPath();
        ctx.rect(rectangles[index].x, rectangles[index].y, tileWidth, tileHeight);
        const { color, percentage } = sectionColor(passes.length, { r: 0, g:0, b: 255 }, 'passes', '')
        ctx.fillStyle = color;
        ctx.fill();
        passes.forEach(detail => {
          const x = detail.position_x * canvasWidth
          const y = detail.position_y * canvasHeight
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI, true);
          console.log(detail.team, details.away_team);
          ctx.fillStyle = Number(detail.team) === Number(details.away_team) ? 'purple' : 'black';
          ctx.fill();
        })
      }
    }

    setShowedSection(prevState => ({ goals: false, shoots: false, passes: !prevState.passes }))
  }

  const handleSelectedPlayer = (id) => {
    if(isSectionShowed.goals) {
      handleGoalsPercente(Number(id))
    } else if (isSectionShowed.passes) {
      handlePassesPercente(Number(id))
    } else if (isSectionShowed.shoots) {
      handleShotsPercente(Number(id))
    }
  }

  return (
    <>
      <div>
        <select 
          onChange={e => {
            setShowedSection(({ goals: false, shoots: false, passes: false }))
            setSelectedTeam(e.target.value)
          }} 
          value={selectedTeam}
        >
          <option value="all">Both</option>
          <option value={details.home_team}>{details.home_team_name}</option>
          <option value={details.away_team}>{details.away_team_name}</option>
        </select>
        <button onClick={handleGoalsPercente}>Goals sections</button>
        <button onClick={handleShotsPercente}>Shoots sections</button>
        <button onClick={handlePassesPercente}>Passes sections</button>
      </div>
      <h1 className="match-time">
        Match date: {details.match_date}
      </h1>
      <div className="pitch">
        <div className="team-container">
          <h1 style={{ display: "flex" }}>{details.home_team_name}
          <div className="home-team"></div></h1>
          
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Shoots</th>
                <th>Passes</th>
              </tr>
            </thead>
            <tbody>
            {teamDetails[details.home_team].players.map(player => (
              <tr 
                className="table_player"
                key={player.id}
                // onClick={() => handleSelectedPlayer(player.id)}
              >
                <td>{player.first_name} {player.last_name}</td>
                <td className="table_shoots-cell">{player.shots_count}</td>
                <td className="table_shoots-cell">{player.passes.length}</td>
              </tr>))}
            </tbody>
          </table>
        </div>
          <canvas
            onClick={handleMouseClick}
            // onMouseMove={handleMouseMove}
            ref={canvas}
            id="pitch"
            width={canvasWidth}
            height={canvasHeight}
          >
          </canvas>
        <div className="team-container">

          <h1 style={{ display: "flex" }}>{details.away_team_name}
          <div className="away-team"></div></h1>
          
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Shoots</th>
                <th>Passes</th>
              </tr>
            </thead>
            <tbody>
            {teamDetails[details.away_team].players.map(player => (
              <tr 
                className="table_player"
                key={player.id}
                // onClick={() => handleSelectedPlayer(player.id)}
              >
                <td>{player.first_name} {player.last_name}</td>
                <td className="table_shoots-cell">{player.shots_count}</td>
                <td className="table_shoots-cell">{player.passes.length}</td>
              </tr>)
            )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default NewPitch;