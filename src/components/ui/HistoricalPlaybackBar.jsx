import React, { useEffect } from 'react';
import { 
  History, 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Clock, 
  Calendar 
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

export function HistoricalPlaybackBar() {
  const historicalTime = useBridgeStore(state => state.historicalTime);
  const setHistoricalTime = useBridgeStore(state => state.setHistoricalTime);
  const isHistoricalPlaying = useBridgeStore(state => state.isHistoricalPlaying);
  const setHistoricalPlaying = useBridgeStore(state => state.setHistoricalPlaying);

  // Auto playback interval
  useEffect(() => {
    let interval = null;
    if (isHistoricalPlaying) {
      interval = setInterval(() => {
        setHistoricalTime(prev => {
          if (historicalTime >= 0) {
            setHistoricalPlaying(false);
            return 0;
          }
          return Math.min(0, historicalTime + 1);
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isHistoricalPlaying, historicalTime, setHistoricalTime, setHistoricalPlaying]);

  const getTimeLabel = (val) => {
    if (val === 0) return '🔴 LIVE TELEMETRY STREAM';
    if (val === -1) return '⏮ 24 HOURS AGO (T - 24h)';
    if (val === -7) return '⏮ 7 DAYS AGO (T - 7d)';
    return `⏮ ${Math.abs(val)} DAYS AGO HISTORICAL LOG`;
  };

  return (
    <div className="historical-playback-bar">
      <div className="hist-header">
        <div className="hist-title">
          <History size={13} className="text-cyan" />
          <span>HISTORICAL DIGITAL TWIN REPLAY</span>
        </div>
        <div className={`hist-time-tag ${historicalTime === 0 ? 'live' : 'history'}`}>
          {getTimeLabel(historicalTime)}
        </div>
      </div>

      <div className="hist-controls-row">
        <button 
          className="hist-play-btn"
          onClick={() => {
            if (historicalTime === 0) setHistoricalTime(-30);
            setHistoricalPlaying(!isHistoricalPlaying);
          }}
          title={isHistoricalPlaying ? "Pause Playback" : "Replay 30-Day Evolution"}
        >
          {isHistoricalPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>

        <div className="hist-slider-wrap">
          <input
            type="range"
            min="-30"
            max="0"
            step="1"
            value={historicalTime}
            onChange={(e) => {
              setHistoricalPlaying(false);
              setHistoricalTime(parseInt(e.target.value));
            }}
            className="slider-range range-cyan hist-range"
          />
          <div className="hist-timeline-ticks">
            <span onClick={() => setHistoricalTime(-30)}>Day -30</span>
            <span onClick={() => setHistoricalTime(-21)}>Day -21</span>
            <span onClick={() => setHistoricalTime(-14)}>Day -14</span>
            <span onClick={() => setHistoricalTime(-7)}>Day -7</span>
            <span onClick={() => setHistoricalTime(-1)}>24h</span>
            <span onClick={() => setHistoricalTime(0)} className="text-cyan font-bold">LIVE</span>
          </div>
        </div>

        {historicalTime !== 0 && (
          <button 
            className="return-live-btn"
            onClick={() => {
              setHistoricalPlaying(false);
              setHistoricalTime(0);
            }}
          >
            <RotateCcw size={11} /> Return Live
          </button>
        )}
      </div>
    </div>
  );
}
