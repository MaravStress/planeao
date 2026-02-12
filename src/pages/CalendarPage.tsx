import React, { useState } from 'react';
import { addWeeks, subWeeks } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import CalendarHeader from '../components/Calendar/CalendarHeader';
import CalendarGrid from '../components/Calendar/CalendarGrid';
import TaskModal from '../components/Calendar/TaskModal';
import '../styles/Calendar.css';

interface Task {
    id: string;
    title: string;
    description: string;
    date: Date;
    duration: number; // in minutes
}

const CalendarPage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedHour, setSelectedHour] = useState<number | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);

    const [wakeHour, setWakeHour] = useState(7);
    const [sleepHour, setSleepHour] = useState(23);

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    const handleTimeSlotClick = (date: Date, hour: number) => {
        setSelectedDate(date);
        setSelectedHour(hour);
        setIsModalOpen(true);
    };

    const handleSaveTask = (taskData: { title: string; description: string; duration: number }) => {
        if (selectedDate && selectedHour !== null) {
            const newTask: Task = {
                id: uuidv4(),
                title: taskData.title,
                description: taskData.description,
                date: new Date(selectedDate.setHours(selectedHour, 0, 0, 0)),
                duration: taskData.duration,
            };
            setTasks([...tasks, newTask]);
        }
    };

    return (
        <div className="page-container">
            <CalendarHeader
                currentDate={currentDate}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                onToday={handleToday}
                wakeHour={wakeHour}
                sleepHour={sleepHour}
                onWakeHourChange={setWakeHour}
                onSleepHourChange={setSleepHour}
            />

            <CalendarGrid
                currentDate={currentDate}
                onTimeSlotClick={handleTimeSlotClick}
                tasks={tasks}
                wakeHour={wakeHour}
                sleepHour={sleepHour}
            />

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
                initialDate={selectedDate}
                initialHour={selectedHour}
            />
        </div>
    );
};

export default CalendarPage;
