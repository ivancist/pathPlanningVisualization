import React, {useEffect} from "react";

export function Node({position, nodeColor = 'blue'}) {
    useEffect(() => {
    }, []);
    return (
        <mesh position={[position.x, position.y, position.z]}>
            <sphereGeometry args={[.1, 16, 16]}/>
            <meshStandardMaterial color={nodeColor}/>
        </mesh>
    );

}

export function Nodes({nodes}) {
    return (
        <group>
            {Object.keys(nodes).map((key) => <Node key={key} position={nodes[key]}
                                                   nodeColor={nodes[key].color || "blue"}/>)}
        </group>
    );
}