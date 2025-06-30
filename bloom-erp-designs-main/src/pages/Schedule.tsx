
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useLanguage } from "@/contexts/LanguageContext";

const Schedule = () => {
  const { t } = useLanguage();
  
  const departments = [
    { name: t('itDepartment'), color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300" },
    { name: t('hrDepartment'), color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-100 dark:bg-green-900/50 dark:text-green-300" },
    { name: t('operations'), color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300" },
  ];

  const timeSlots = [
    "00:00-08:00", "08:00-16:00", "16:00-24:00"
  ];

  const weekdays = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')];

  // Initial schedule state
  const [schedule, setSchedule] = useState(() => {
    const initialSchedule: { [key: string]: string } = {};
    const departmentNames = [t('itDepartment'), t('hrDepartment'), t('operations')];
    
    weekdays.forEach((day, dayIndex) => {
      timeSlots.forEach((timeSlot, timeIndex) => {
        const key = `${dayIndex}-${timeIndex}`;
        // Rotating departments across different shifts
        const schedules = [
          [t('itDepartment'), t('hrDepartment'), t('operations')],
          [t('hrDepartment'), t('operations'), t('itDepartment')],
          [t('operations'), t('itDepartment'), t('hrDepartment')],
          [t('itDepartment'), t('hrDepartment'), t('operations')],
          [t('hrDepartment'), t('operations'), t('itDepartment')],
          [t('operations'), t('itDepartment'), t('hrDepartment')],
          [t('itDepartment'), t('operations'), t('hrDepartment')],
        ];
        initialSchedule[key] = schedules[dayIndex][timeIndex];
      });
    });
    
    return initialSchedule;
  });

  const getDepartmentStyle = (departmentName: string) => {
    const dept = departments.find(d => d.name === departmentName);
    return dept ? { textColor: dept.textColor, bgColor: dept.bgColor } : { textColor: "text-gray-700 dark:text-gray-300", bgColor: "bg-gray-100 dark:bg-gray-800" };
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId) return;

    const sourceKey = source.droppableId;
    const destKey = destination.droppableId;

    setSchedule(prev => {
      const newSchedule = { ...prev };
      const sourceDept = newSchedule[sourceKey];
      const destDept = newSchedule[destKey];
      
      // Switch departments
      newSchedule[sourceKey] = destDept;
      newSchedule[destKey] = sourceDept;
      
      return newSchedule;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('departmentSchedule')}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t('weeklyScheduleDesc')}</p>
      </div>

      {/* Department Legend */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">{t('departments')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {departments.map((dept) => (
              <div key={dept.name} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${dept.color}`}></div>
                <span className="text-sm font-medium dark:text-gray-300">{dept.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">{t('weeklyScheduleGrid')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-200 dark:border-gray-600 py-3 px-4 text-left font-semibold text-gray-900 dark:text-white">
                      {t('timeSlot')}
                    </th>
                    {weekdays.map((day) => (
                      <th key={day} className="border border-gray-200 dark:border-gray-600 py-3 px-4 text-center font-semibold text-gray-900 dark:text-white">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot, timeIndex) => (
                    <tr key={timeSlot} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="border border-gray-200 dark:border-gray-600 py-4 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
                        {timeSlot}
                      </td>
                      {weekdays.map((day, dayIndex) => {
                        const cellKey = `${dayIndex}-${timeIndex}`;
                        const departmentName = schedule[cellKey];
                        const style = getDepartmentStyle(departmentName);
                        return (
                          <td key={`${day}-${timeSlot}`} className="border border-gray-200 dark:border-gray-600 py-4 px-4 text-center">
                            <Droppable droppableId={cellKey}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`min-h-[40px] flex items-center justify-center ${
                                    snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/30 rounded-lg' : ''
                                  }`}
                                >
                                  <Draggable draggableId={`${cellKey}-${departmentName}`} index={0}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`${
                                          snapshot.isDragging ? 'transform rotate-6 scale-105' : ''
                                        }`}
                                      >
                                        <Badge 
                                          variant="secondary" 
                                          className={`${style.bgColor} ${style.textColor} font-medium px-3 py-1 cursor-grab active:cursor-grabbing transition-transform hover:scale-105`}
                                        >
                                          {departmentName}
                                        </Badge>
                                      </div>
                                    )}
                                  </Draggable>
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.name} className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <div className={`w-4 h-4 rounded ${dept.color}`}></div>
                <span>{dept.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('weeklyHours')}:</span>
                  <span className="font-medium dark:text-gray-300">56 {t('hours')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('employees')}:</span>
                  <span className="font-medium dark:text-gray-300">
                    {dept.name === t('itDepartment') ? "45" : dept.name === t('hrDepartment') ? "32" : "65"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('shiftPattern')}:</span>
                  <span className="font-medium dark:text-gray-300">{t('eightHourShifts')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
