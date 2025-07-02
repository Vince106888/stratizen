const ResourceCard = ({ resource }) => (
  <div className="p-4 bg-gray-100 rounded shadow">
    <h3 className="font-semibold">{resource.title}</h3>
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
      View Resource
    </a>
  </div>
);

export default ResourceCard;
