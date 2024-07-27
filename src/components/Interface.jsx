
import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css'; // Import your CSS file

const Interface = () => {
  const mapRef = useRef(null);
  const [commandResult, setCommandResult] = useState('Say something...');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize the map
    const map = L.map(mapRef.current).setView([23.0, 78.0], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 29
    }).addTo(map);

    // Set up voice recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.interimResults = false;
      recog.lang = 'en-US';
      setRecognition(recog);

      recog.addEventListener('result', (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setCommandResult(`You said: ${command}`);

        if (command.includes('zoom in')) {
          map.zoomIn();
          setCommandResult("Zoomed in");
        } else if (command.includes('zoom out')) {
          map.zoomOut();
          setCommandResult("Zoomed out");
        } else if (command.includes('show highways in')) {
          const location = command.split('show highways in ')[1].trim();
          if (location) {
            fetchHighways(location, map);
          } else {
            setCommandResult(`State not recognized`);
          }
        } else {
          setCommandResult(`Command not recognized: ${command}`);
        }
      });

      recog.addEventListener('error', (event) => {
        setCommandResult(`Error: ${event.error}`);
      });

      recog.addEventListener('end', () => {
        setCommandResult("Listening stopped. Press 'Start Listening' to start again.");
      });
    }

    // Ask for microphone permission
    navigator.permissions.query({ name: 'microphone' }).then(result => {
      if (result.state === 'denied') {
        alert('Microphone access is denied. Please enable it to use voice commands.');
      }
    });

    return () => {
      map.remove(); // Cleanup on unmount
    };
  }, []);

  const fetchHighways = (state, map) => {
    const highwaysData = {
      "madhya pradesh": [
        {
          "name": "NH 12",
          "coordinates": [[77.0247, 22.3118], [76.9896, 22.2176]]
        },
        {
          "name": "NH 30",
          "coordinates": [[81.8817, 22.6918], [81.8820, 22.6340]]
        },
        {
          "name": "NH 46",
          "coordinates": [[78.7220, 23.0498], [78.7716, 23.0556]]
        },
        {
          "name": "NH 59",
          "coordinates": [[75.8655, 22.8540], [75.8534, 22.8406]]
        },
        {
          "name": "NH 69",
          "coordinates": [[78.5580, 22.5761], [78.5580, 22.5761]]
        },
        {
          "name": "NH 7",
          "coordinates": [[78.5335, 22.4266], [78.6064, 22.4127]]
        },
        {
          "name": "NH 75",
          "coordinates": [[78.7417, 22.5641], [78.7464, 22.5714]]
        },
        {
          "name": "NH 59A",
          "coordinates": [[75.8582, 22.9434], [75.8712, 22.9512]]
        },
        {
          "name": "NH 92",
          "coordinates": [[76.9147, 23.3657], [76.9204, 23.3741]]
        },
        {
          "name": "NH 133",
          "coordinates": [[77.0857, 22.6068], [77.0952, 22.6141]]
        },
        {
          "name": "NH 52",
          "coordinates": [[77.0100, 23.0220], [76.9800, 23.0100]]
        },
        {
          "name": "NH 26",
          "coordinates": [[80.1234, 22.4567], [80.0987, 22.4334]]
        },
        {
          "name": "NH 43",
          "coordinates": [[82.1234, 22.9876], [82.1456, 22.9654]]
        },
        {
          "name": "NH 50",
          "coordinates": [[77.4567, 23.4567], [77.4789, 23.4890]]
        },
        {
          "name": "NH 60",
          "coordinates": [[78.3456, 22.6789], [78.3567, 22.6890]]
        },
        {
          "name": "NH 98",
          "coordinates": [[76.5678, 22.8765], [76.5789, 22.8876]]
        },
        {
          "name": "NH 10",
          "coordinates": [[77.3456, 23.1234], [77.3567, 23.2345]]
        },
        {
          "name": "NH 14",
          "coordinates": [[78.1234, 22.5678], [78.1345, 22.5789]]
        }
      ],
    };

    state = state.replace(/\.$/, '');
    const highways = highwaysData[state.toLowerCase()];

    if (!highways || highways.length === 0) {
      setCommandResult(`No highways data available for state: ${state}`);
      return;
    }

    const bounds = L.latLngBounds([]);

    highways.forEach(highway => {
      const start = highway.coordinates[0];
      const end = highway.coordinates[1];
      const marker = L.marker([start[1], start[0]], {
        icon: L.divIcon({
          className: 'highway-marker',
          html: `<div>${highway.name}</div>`
        })
      }).addTo(map);

      bounds.extend(marker.getLatLng());

      L.polyline([
        [start[1], start[0]],
        [end[1], end[0]]
      ], {
        color: '#FF1493',
        weight: 4
      }).addTo(map);
    });

    map.fitBounds(bounds);
    map.setZoom(map.getZoom() + 2);
    setCommandResult(`Showing highways in: ${state}`);
  };

  const handleStartListening = () => {
    if (recognition) {
      recognition.start();
      setCommandResult("Listening...");
    }
  };

  return (
    <div>
      <div id="map" ref={mapRef}></div>
      <div id="voiceCommand">
        <p id="commandResult">{commandResult}</p>
        <button id="startListening" onClick={handleStartListening}>Start Listening</button>
      </div>
      <div id="commandsList">
        <h3>Voice Commands</h3>
        <ul>
          <li><strong>Zoom in:</strong> Zooms the map in by one level.</li>
          <li><strong>Zoom out:</strong> Zooms the map out by one level.</li>
          <li><strong>Show highways in Madhya Pradesh:</strong> Centers and zooms the map to the specified state and displays highways.</li>
        </ul>
      </div>
    </div>
  );
};

export default Interface;
