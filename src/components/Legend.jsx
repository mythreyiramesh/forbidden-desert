// src/components/Legend.jsx
import React, { useEffect, useRef } from 'react';
import TileFace from './TileFace';
import EquipmentToken from './EquipmentToken';
import { PlayerGlyph } from './PlayerToken';
import { PartGlyph, PART_NAMES } from './PartToken';
import { CheckIcon, DashIcon } from './Icons';
import playerInfo from '../playerInfoData.json';
import partInfo from '../partInfoData.json';
import equipmentDeck from '../equipmentDeck.json';
import './Legend.css';

const equipmentTypes = [...new Set(equipmentDeck.map((e) => e.type))];

const Item = ({ specimen, children }) => (
  <li className="legend-item">
    <span className="legend-specimen">{specimen}</span>
    <span>{children}</span>
  </li>
);

const Face = ({ id }) => (
  <span className="legend-tile"><TileFace desertID={id} /></span>
);

function Legend({ onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <section id="legend" className="legend" aria-label="Legend" ref={ref} tabIndex={-1}>
      <div className="legend-head">
        <h2>Legend</h2>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="legend-grid">
        <div>
          <h3>Unexcavated tiles</h3>
          <ul>
            <Item specimen={<span className="tile legend-box" />}>Not dug up yet.</Item>
            <Item specimen={<span className="tile has-water legend-box" />}>Ripples: a water tile, a real well or a mirage.</Item>
            <Item specimen={<span className="tile storm legend-box" />}>The storm. Tiles it leaves behind gain sand.</Item>
            <Item specimen={<span className="sand-badge">1</span>}>Sand. Click to remove one level.</Item>
            <Item specimen={<span className="tile blocked legend-box" />}>Tinted: two or more sand, the tile is blocked.</Item>
            <Item specimen={<span className="sand-badge">+</span>}>Corrections mode: adds a level of sand.</Item>
          </ul>
        </div>

        <div>
          <h3>Tile faces</h3>
          <ul>
            <Item specimen={<Face id={12} />}>Gear: you find equipment.</Item>
            <Item specimen={<Face id={1} />}>Tunnel: shelter from the sun, and equipment.</Item>
            <Item specimen={<Face id={22} />}>Well: water.</Item>
            <Item specimen={<Face id={21} />}>Dashed rings: the mirage, no water.</Item>
            <Item specimen={<Face id={24} />}>Diamond: the take-off zone.</Item>
            <Item specimen={<span className="legend-pair"><Face id={9} /><Face id={8} /></span>}>
              Clue. The arrow gives the direction and the mark in the middle names the part.
            </Item>
          </ul>
        </div>

        <div>
          <h3>Players</h3>
          <ul>
            {playerInfo.map((player) => (
              <Item key={player.id} specimen={<span className={`player-token ${player.type}`}><PlayerGlyph type={player.type} /></span>}>
                {player.name}
              </Item>
            ))}
            <Item specimen={<span className="water-pips"><span className="pip full" /><span className="pip full" /><span className="pip" /></span>}>
              Water: one dot per drink, filled while it lasts.
            </Item>
          </ul>
        </div>

        <div>
          <h3>Parts</h3>
          <ul>
            {partInfo.map((part) => (
              <Item key={part.id} specimen={<span className={`part-token ${part.type}`}><PartGlyph type={part.type} /></span>}>
                {PART_NAMES[part.type] ?? part.type}
              </Item>
            ))}
          </ul>
          <h3>Tracker</h3>
          <ul>
            <Item specimen={<span className="found-mark"><CheckIcon /></span>}>Done.</Item>
            <Item specimen={<span className="legend-dash"><DashIcon /></span>}>Not yet.</Item>
          </ul>
        </div>

        <div>
          <h3>Equipment</h3>
          <ul>
            {equipmentTypes.map((type) => (
              <Item key={type} specimen={<EquipmentToken type={type} />}>{type}</Item>
            ))}
            <Item specimen={<EquipmentToken type="Solar Shield" active />}>Blue: a Solar Shield that is running.</Item>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Legend;
