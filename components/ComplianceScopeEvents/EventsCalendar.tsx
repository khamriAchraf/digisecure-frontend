import React, { useEffect } from 'react'
import { ComplianceScopeEvent } from '../../types/models'
import { Calendar, dayjsLocalizer } from "react-big-calendar"
import dayjs from 'dayjs'

const localizer = dayjsLocalizer(dayjs)

const EventsCalendar = ({ events }: { events: ComplianceScopeEvent[] }) => {

    useEffect(() => {
        events.forEach(event => {
            // @ts-ignore
            event.start = new Date(event.next_due_date)
            // @ts-ignore
            event.end = new Date(event.next_due_date)
            event.title = event.name
            event.allDay = true
        })
    }, [events])
    
    return (
        <div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
            />
        </div>
    )
}

export default EventsCalendar