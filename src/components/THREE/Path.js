import React, {useEffect, useRef} from "react";
import * as THREE from "three";
import {Line} from "@react-three/drei";
import {useThree} from "@react-three/fiber";

export function Path({nodes}) {
    const {scene} = useThree()
    const instancedNodes = useRef()
    const nodeMaterial = new THREE.MeshStandardMaterial({
        color: 'green'
    })
    const nodeGeometry = new THREE.SphereGeometry(.05, 8, 8);
    useEffect(() => {
        if (!instancedNodes.current) {
            instancedNodes.current = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, 500); // Assuming 100,000 instances
            instancedNodes.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
            instancedNodes.current.count = 0
            scene.add(instancedNodes.current);
        }
        return () => {
            scene.remove(instancedNodes.current);
        };
    }, [])
    useEffect(() => {
        if (instancedNodes.current) {
            instancedNodes.current.count = nodes.length
            nodes.forEach((position, index) => {
                const matrix = new THREE.Matrix4();
                matrix.compose(position, new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
                instancedNodes.current.setMatrixAt(index, matrix);
            });
            instancedNodes.current.instanceMatrix.needsUpdate = true;
        }
    }, [nodes]);


    return (
        <group>
            <Line points={nodes.map((node) => [node.x, node.y, node.z])} color={"green"} lineWidth={1} />
        </group>
    );
}