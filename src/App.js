import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Scene, {Nodes} from "./components/ThreeScene";
import useWebSocket, {ReadyState} from 'react-use-websocket';
import binaryDataToVoxels, {decodeMessage} from './utils/converter.js';
import * as THREE from 'three';
import {Button} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import {Canvas} from '@react-three/fiber';


const WS_URL = 'ws://localhost:9002';

export default function App() {
    const [inputValue, setInputValue] = useState('');
    const [voxels, setVoxels] = useState({positions: [], sizes: []});
    const [nodes, setNodes] = useState([]);
    const [endpoints, setEndpoints] = useState({});
    const [chronoPath, setChronoPath] = useState([])

    const {sendMessage, getWebSocket, readyState} = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log('WebSocket connection established.');
            if (voxels.positions.length > 0) {
                setVoxels({positions: [], sizes: []})
            }
            if (nodes.length > 0) {
                setNodes([])
                setChronoPath([])
            }
            if (endpoints.hasOwnProperty('start')) {
                setEndpoints({})
            }
        },
        onClose: () => console.log('WebSocket connection closed.'),
        onError: (event) => {
            console.error('WebSocket error:', event)
        },
        onMessage: (event) => {
            const msg = decodeMessage(event.data);
            if (msg.topic === 'octomap') {
                const voxelsData = binaryDataToVoxels(msg.binaryData);
                voxelsData.positions = voxelsData.positions.map((coords) => new THREE.Vector3(...coords));
                setVoxels(voxelsData);
                console.log("Voxels received")
            } else if (msg.topic === 'octomap_path') {
                const nodes = JSON.parse(new TextDecoder('utf-8').decode(msg.binaryData));
                console.log("Path received")
                setNodes(nodes.path);
                setChronoPath(chronoPath => [...chronoPath, nodes.time])
            } else if (msg.topic === 'octomap_endpoints') {
                const endpoints = JSON.parse(new TextDecoder('utf-8').decode(msg.binaryData));
                console.log("Endpoints received")
                setEndpoints(endpoints);
            } else {
                console.log('Received message:', msg);
            }

        },
        shouldReconnect: (closeEvent) => {
            console.log('WebSocket closed with code:', closeEvent.code);
            return closeEvent.code === 1006;
        },
    });

    const apiCall = () => {
        axios.get('http://localhost:8080').then((data) => {
            console.log(data)
        })
    }
    const closeWebSocketConnection = () => {
        const webSocketInstance = getWebSocket();
        if (webSocketInstance && webSocketInstance.readyState === WebSocket.OPEN) {
            webSocketInstance.close();
        }
    };

    useEffect(() => {
        if (readyState === WebSocket.OPEN) {
            const webSocketInstance = getWebSocket();
            if (webSocketInstance && 'binaryType' in webSocketInstance) {
                webSocketInstance.binaryType = 'arraybuffer';
            }
        }

        window.addEventListener('beforeunload', closeWebSocketConnection);

        return () => {
            window.removeEventListener('beforeunload', closeWebSocketConnection);
        };
    }, [readyState]);


    const handleSend = () => {
        sendMessage(inputValue);
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return (
        <div className="App">
            <header className="App-header">
                <Button variant="contained" startIcon={<SendIcon/>} onClick={apiCall}>
                    Api Call
                </Button>
                <span>Status: {connectionStatus}</span>
                <input type="text" value={inputValue} onChange={handleInputChange}/>
                <button onClick={handleSend}>Send Message</button>
                <button onClick={closeWebSocketConnection}>Close WebSocket Connection</button>
                <br/>
                <p>Path received: {chronoPath.length}</p>
                {chronoPath.length > 0 ? <p>First contact: {chronoPath[0].toLocaleString()} microseconds</p> : null}
                {chronoPath.length > 1 ? <p>Last contact: {chronoPath[chronoPath.length - 1].toLocaleString()} microseconds</p> : null}
            </header>
            <Canvas style={{position: "absolute", inset: 0, zIndex: -1}}>
                <Scene connection={readyState} voxels={voxels} endpoints={endpoints} nodes={nodes}/>
            </Canvas>

        </div>
    );
}