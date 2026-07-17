import type React from "react";
import GoogleIcon from "../GoogleIcon";

interface ProjectPanelTabWhiteboardProps {
    name?: string;
}

const ProjectPanelTabWhiteboard: React.FC<ProjectPanelTabWhiteboardProps> = ({ name }) => {

    if (name != "") {

    } else {

    }
    return (
        <>
            <div className="empty-tab-state">
                <GoogleIcon name="gesture" size={48} style={{ color: 'var(--color-primary-light)' }} />
                <h3>Whiteboard</h3>
                <p>Esta pestaña se encuentra vacía por el momento. Aquí tendrás un espacio de dibujo y notas libres para <strong>{name}</strong>.</p>
            </div>
        </>
    );
}

export default ProjectPanelTabWhiteboard;