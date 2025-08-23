import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaVolumeUp, FaVolumeMute, FaForward, FaBackward } from 'react-icons/fa';

interface AudioPlayerProps {
  surahNumber: number;
  ayahNumber: number;
  reciterId: number;
  onAyahChange: (ayahNumber: number) => void;
  totalAyahs: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  surahNumber,
  ayahNumber,
  reciterId,
  onAyahChange,
  totalAyahs
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const reciterMap: { [key: number]: string } = {
    1: 'ar.abdulbasitmurattal',
    2: 'ar.alafasy',
    3: 'ar.saadalghamdi',
    4: 'ar.ahmedajamy',
    5: 'ar.hanirifai'
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const loadAudio = async () => {
    if (!audioRef.current) return;
    
    setLoading(true);
    const reciterCode = reciterMap[reciterId];
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    const paddedAyah = ayahNumber.toString().padStart(3, '0');
    
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${reciterCode}/${paddedSurah}${paddedAyah}.mp3`;
    
    audioRef.current.src = audioUrl;
    
    audioRef.current.onloadeddata = () => {
      setLoading(false);
    };
    
    audioRef.current.onerror = () => {
      setLoading(false);
      console.error('Error loading audio');
    };
  };

  useEffect(() => {
    loadAudio();
  }, [surahNumber, ayahNumber, reciterId]);

  const play = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const nextAyah = () => {
    if (ayahNumber < totalAyahs) {
      onAyahChange(ayahNumber + 1);
    }
  };

  const previousAyah = () => {
    if (ayahNumber > 1) {
      onAyahChange(ayahNumber - 1);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player bg-white rounded-lg shadow-md p-4 mb-6">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (ayahNumber < totalAyahs) {
            nextAyah();
          }
        }}
      />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={previousAyah}
            disabled={ayahNumber <= 1}
            className="p-2 text-gray-600 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaBackward />
          </button>
          
          <button
            onClick={isPlaying ? pause : play}
            disabled={loading}
            className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : isPlaying ? (
              <FaPause />
            ) : (
              <FaPlay />
            )}
          </button>
          
          <button
            onClick={stop}
            className="p-2 text-gray-600 hover:text-red-600"
          >
            <FaStop />
          </button>
          
          <button
            onClick={nextAyah}
            disabled={ayahNumber >= totalAyahs}
            className="p-2 text-gray-600 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaForward />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 text-gray-600 hover:text-blue-600"
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      <div className="mb-2">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-600">
        Playing Ayah {ayahNumber} of {totalAyahs}
      </div>
    </div>
  );
};

export default AudioPlayer;