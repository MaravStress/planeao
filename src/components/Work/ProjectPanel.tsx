import type React from "react";
import ProjectPanelTabInfo from "./ProjectPanelTabInfo";
import ProjectPanelTabKamban from "./ProjectPanelTabKamban";
import ProjectPanelTabWhiteboard from "./ProjectPanelTabWhiteBoard";

interface ProjectProps {
    name?: string;
}

const ProjectPanel: React.FC<ProjectProps> = ({ name }) => {

    if (name != "") {

    } else {

    }
    return (
        <>
            klk mundo
        </>
    );
}

export default ProjectPanel;