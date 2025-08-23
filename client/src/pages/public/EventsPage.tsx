import React, { useState, useEffect } from 'react';
import { Event } from '../../../../shared/types';
import { eventsAPI, EventFilters as EventFiltersType } from '../../services/eventsApi';
import EventFilters from '../../components/events/EventFilters';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EventFiltersType>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEvents(filters);
      if (response.success && response.data) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const handleSearch = () => {
    setFilters({
      ...filters,
      search: searchTerm || undefined,
      eventType: selectedType as any || undefined
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setFilters({});
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'islamic_holiday': return '#2c5530';
      case 'community_event': return '#1a3d1f';
      case 'educational': return '#4a5d23';
      default: return '#2c5530';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="text-center mb-2">
        <h1>Islamic Events</h1>
        <p>Stay updated with Islamic holidays, community events, and educational programs</p>
      </header>

      {/* Search and Filter Section */}
      <section className="section">
        <EventFilters
          searchTerm={searchTerm}
          selectedType={selectedType}
          onSearchChange={setSearchTerm}
          onTypeChange={setSelectedType}
          onSearch={handleSearch}
          onClear={clearFilters}
        />
      </section>

      <main>
        <section className="section">
          <div className="events-container">
            {events.length === 0 ? (
              <p className="text-center">No upcoming events at this time.</p>
            ) : (
              <div className="events-grid">
                {events.map((event) => (
                  <div key={event._id} className="event-card">
                    <div 
                      className="event-type-badge"
                      style={{ backgroundColor: getEventTypeColor(event.eventType) }}
                    >
                      {event.eventType.replace('_', ' ').toUpperCase()}
                    </div>
                    
                    <h3>{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                    
                    <div className="event-details">
                      <div className="event-date">
                        <strong>📅 Date:</strong> {formatDate(new Date(event.startDate))}
                        {new Date(event.startDate).getTime() !== new Date(event.endDate).getTime() && (
                          <span> - {formatDate(new Date(event.endDate))}</span>
                        )}
                      </div>
                      
                      <div className="event-location">
                        <strong>📍 Location:</strong> {event.location.name}
                        <br />
                        <small>{event.location.address}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="events-info">
            <h2>About Islamic Events</h2>
            <p>
              Stay connected with your community through our comprehensive events calendar. 
              We feature Islamic holidays, community gatherings, and educational programs.
            </p>
            
            <div className="event-types">
              <h3>Event Types:</h3>
              <ul>
                <li><strong>Islamic Holidays:</strong> Major religious observances like Ramadan, Eid, and Hajj</li>
                <li><strong>Community Events:</strong> Local gatherings, iftar dinners, and social activities</li>
                <li><strong>Educational:</strong> Lectures, workshops, and learning opportunities</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EventsPage;