import React from 'react';

interface EventFiltersProps {
  searchTerm: string;
  selectedType: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const eventTypeOptions = [
  { value: 'islamic_holiday', label: 'Islamic Holiday' },
  { value: 'community_event', label: 'Community Event' },
  { value: 'educational', label: 'Educational' },
  { value: 'community_services', label: 'Community Services' },
  { value: 'youth_sports', label: 'Youth Sports & Athletics' },
  { value: 'faith_programs', label: 'Faith Programs' },
  { value: 'social_justice', label: 'Social Justice' },
  { value: 'access_services', label: 'Access to Services' },
  { value: 'health_advocacy', label: 'Health Advocacy' },
  { value: 'environment_climate', label: 'Environment & Climate' },
  { value: 'drug_violence_prevention', label: 'Drug & Violence Prevention' },
  { value: 'voter_education', label: 'Voter Education' },
  { value: 'mental_health', label: 'Mental Health Awareness' },
  { value: 'youth_education', label: 'Youth Education & Tutoring' }
];

const EventFilters: React.FC<EventFiltersProps> = ({
  searchTerm,
  selectedType,
  onSearchChange,
  onTypeChange,
  onSearch,
  onClear
}) => {
  return (
    <div className="events-filters">
      <div className="filter-row">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
        />
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          {eventTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button onClick={onSearch} className="btn-primary">
          Search
        </button>
        <button onClick={onClear} className="btn-secondary">
          Clear
        </button>
      </div>
    </div>
  );
};

export default EventFilters;