import React, {useEffect, useState} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {OrbitControls} from '@react-three/drei';
import {Octomap} from "./THREE/Octomap";
import {Nodes} from "./THREE/Nodes";
import {Path} from "./THREE/Path";

export function Grid() {
    const {scene, camera} = useThree();

    useEffect(() => {
        THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
        camera.up.set(0, 0, 1);
        const gridHelper = new THREE.GridHelper(10, 10);
        gridHelper.rotation.x = Math.PI / 2;
        scene.add(gridHelper);
        const axesHelper = new THREE.AxesHelper( 10);
        scene.add( axesHelper );

        // Set the camera position and look at the origin
        camera.position.set(0, 10, 5);
        camera.lookAt(0, 0, 0);

        return () => {
            scene.remove(gridHelper);
            scene.remove(axesHelper);
        };
    }, [scene, camera]);

    return null;
}

const Scene = ({connection, voxels, endpoints, nodes, optPath, smoothPath}) => {
    return (<group>
            <ambientLight intensity={1}/>
            <directionalLight position={[30, 30, -30]} intensity={1}/>
            {connection === 1 ?
            <group>
                <Octomap voxels={voxels}/>
                {endpoints.hasOwnProperty('start') ? <Nodes nodes={endpoints}/> : null}
                {nodes.length > 0 ? <Path nodes={nodes} color={new THREE.Color(0x00a86b)}/> : null}
                {optPath.length > 0 ? <Path nodes={optPath} color={new THREE.Color(0x1E90FF)}/> : null}
                {smoothPath.length > 0 ? <Path nodes={smoothPath} color={"blue"}/> : null}
            </group>
                : null}
            <Grid/>
            <OrbitControls/>
        </group>
    );
}

export default Scene;