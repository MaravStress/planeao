export interface BusinessModelCanvas {
    keyPartners: string;
    keyActivities: string;
    keyResources: string;
    valuePropositions: string;
    customerRelationships: string;
    channels: string;
    customerSegments: string;
    costStructure: string;
    revenueStreams: string;
}

export interface Idea {
    id: string;
    title: string;
    category: string;
    status: string;
    imageUrl: string;
    description: string;
    canvas: BusinessModelCanvas;
    createdAt: string;
    updatedAt: string;
}

export interface IdeaSettingsItem {
    id: string;
    name: string;
    color: string;
}

export interface IdeaSettings {
    categories: IdeaSettingsItem[];
    statuses: IdeaSettingsItem[];
}

