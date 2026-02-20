import type { Idea, IdeaSettings } from '../../types/ideas';

interface IdeaCardProps {
    idea: Idea;
    settings: IdeaSettings;
    onClick: (idea: Idea) => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, settings, onClick }) => {
    const categoryColor = settings.categories.find(c => c.name === idea.category)?.color || '#888888';
    const statusColor = settings.statuses.find(s => s.name === idea.status)?.color || '#888888';

    return (
        <div className="idea-card" onClick={() => onClick(idea)}>
            <div className="idea-card-image">
                {idea.imageUrl ? (
                    <img src={idea.imageUrl} alt={idea.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span>Sin imagen</span>
                )}
            </div>
            <div className="idea-card-content">
                <h3 className="idea-card-title">{idea.title}</h3>
                <div className="idea-card-meta">
                    <span className="idea-category" style={{ backgroundColor: `${categoryColor}22`, color: categoryColor, border: `1px solid ${categoryColor}44` }}>
                        {idea.category}
                    </span>
                    <span className="idea-status" style={{ backgroundColor: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44` }}>
                        {idea.status}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default IdeaCard;
