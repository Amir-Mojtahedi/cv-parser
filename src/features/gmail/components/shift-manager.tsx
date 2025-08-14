"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Bot,
  CheckCircle,
  AlertTriangle,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { manageShift } from "@/features/gmail/utils";
import { sendEmails } from "@/features/gmail/gmailService";
import { Shift, Worker } from "@/features/gmail/types";
import { 
  createShift, 
  getAllShifts, 
  setShiftPendingResponse,
  assignWorkerToShift,
} from "@/features/database/supabase/shiftSupabaseService";

export function ShiftManager() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [departments, setDepartments] = useState([
    "Floor Staff",
    "Kitchen",
    "Management",
  ]);
  const [newDepartment, setNewDepartment] = useState("");
  const [isOpenShiftPanelOpen, setIsOpenShiftPanelOpen] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState<Set<string>>(new Set());
  const [newShiftData, setNewShiftData] = useState({
    date: selectedDate,
    startTime: "15:00",
    endTime: "20:00",
    department: "Floor Staff",
  });

  // Load shifts from database on component mount
  useEffect(() => {
    loadShiftsFromDatabase();
  }, []);

  const loadShiftsFromDatabase = async () => {
    try {
      const shiftRecords = await getAllShifts();
      const convertedShifts: Shift[] = shiftRecords.map(record => ({
        id: record.id,
        date: record.date,
        startTime: record.start_time,
        endTime: record.end_time,
        department: record.department,
        status: record.status,
        worker: record.worker_name && record.worker_email ? {
          name: record.worker_name,
          email: record.worker_email
        } : null,
        gmailThreadId: record.gmail_thread_id || undefined,
        gmailMessageId: record.gmail_message_id || undefined,
      }));
      setShifts(convertedShifts);
    } catch (error) {
      console.error("Failed to load shifts:", error);
      alert("Failed to load shifts from database");
    }
  };

  const workers: Worker[] = [
    {
      name: "Amirreza Mojtahedi",
      email: "amirrezamojtahedi2@gmail.com",
    },
    {
      name: "Mohammad Javad Mojtahedi",
      email: "m.j.modjtahedi@gmail.com",
    },
    {
      name: "Sogand Zendehdel Moghaddam",
      email: "sogand.moghaddam1342@gmail.com",
    },
  ];

  const getShiftsForDate = (date: string) =>
    shifts.filter((shift) => shift.date === date);

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const getStatusColor = (s: string) =>
    ({
      assigned: "bg-green-100 text-green-800",
      open: "bg-red-100 text-red-800",
      pending_response: "bg-yellow-100 text-yellow-800",
    }[s] || "bg-gray-100 text-gray-800");

  const getDepartmentColor = (d: string) =>
    ({
      "Floor Staff": "bg-blue-100 text-blue-800",
      Kitchen: "bg-orange-100 text-orange-800",
      Management: "bg-purple-100 text-purple-800",
    }[d] || "bg-gray-100 text-gray-800");

  const broadcastShift = async (shift: Shift) => {
    setLoadingShifts((prev) => new Set(prev).add(shift.id));
    const emails = workers.map((worker) => worker.email);
    const result = await sendEmails(
      emails,
      `Shift Available: ${shift.department} on ${shift.date}`,
      `<p>Hello,</p><p>A new shift is available:</p><ul><li><strong>Date:</strong> ${
        shift.date
      }</li><li><strong>Time:</strong> ${formatTime(
        shift.startTime
      )} - ${formatTime(shift.endTime)}</li><li><strong>Department:</strong> ${
        shift.department
      }</li></ul><p>Please reply to this email if you would like to take this shift.</p>`
    );

    if (result.success && result.threadId && result.messageId) {
      try {
        // Update shift in database
        await setShiftPendingResponse(shift.id, result.threadId, result.messageId);
        
        // Update local state
        setShifts((prevShifts) =>
          prevShifts.map((s) =>
            s.id === shift.id
              ? {
                  ...s,
                  status: "pending_response",
                  gmailThreadId: result.threadId,
                  gmailMessageId: result.messageId,
                }
              : s
          )
        );
      } catch (error) {
        console.error("Failed to update shift in database:", error);
        alert("Shift broadcasted but failed to update database. Please refresh the page.");
      }
    } else {
      alert(`Failed to broadcast shift: ${result.error}`);
    }

    setLoadingShifts((prev) => {
      const newSet = new Set(prev);
      newSet.delete(shift.id);
      return newSet;
    });
  };

  const handleAssignShift = async (shift: Shift) => {
    if (!shift.gmailThreadId) {
      alert("Error: This shift does not have a broadcast thread ID.");
      return;
    }
    setLoadingShifts((prev) => new Set(prev).add(shift.id));
    try {
      const updatedShift = await manageShift(shift);
      
      // If worker was assigned, update the database
      if (updatedShift.status === "assigned" && updatedShift.worker) {
        try {
          await assignWorkerToShift(
            updatedShift.id,
            updatedShift.worker.name,
            updatedShift.worker.email
          );
        } catch (dbError) {
          console.error("Failed to update database:", dbError);
          alert("Worker assigned but failed to update database. Please refresh the page.");
        }
      }
      
      setShifts((prevShifts) =>
        prevShifts.map((s) => (s.id === updatedShift.id ? updatedShift : s))
      );
      if (updatedShift.status !== "assigned") {
        alert("No suitable reply found yet. You can try again later.");
      }
    } catch (error) {
      console.error("Failed to assign shift:", error);
      alert(
        `An error occurred while assigning the shift: ${
          (error as Error).message
        }`
      );
    } finally {
      setLoadingShifts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(shift.id);
        return newSet;
      });
    }
  };

  // --- Month Navigation and Department Handlers ---
  const handlePrevMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );

  const handleNextMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );

  const handleAddDepartment = () => {
    if (
      newDepartment &&
      !departments.find((d) => d.toLowerCase() === newDepartment.toLowerCase())
    ) {
      setDepartments((prev) => [...prev, newDepartment]);
      setNewDepartment("");
    } else {
      alert("Department is empty or already exists.");
    }
  };

  // --- Calendar Day and New Shift Form Logic ---
  const calendarDays = (() => {
    const first = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const start = new Date(first);
    start.setDate(start.getDate() - first.getDay());
    const days = [],
      cd = new Date(start);
    while (days.length < 42) {
      const ds = cd.toISOString().split("T")[0];
      const dsSh = getShiftsForDate(ds);
      days.push({
        date: ds,
        day: cd.getDate(),
        isCurrentMonth: cd.getMonth() === currentDate.getMonth(),
        isToday: ds === new Date().toISOString().split("T")[0],
        isSelected: ds === selectedDate,
        assignedShifts: dsSh.filter((s) => s.status === "assigned").length,
        openShifts: dsSh.filter(
          (s) => s.status === "open" || s.status === "pending_response"
        ).length,
      });
      cd.setDate(cd.getDate() + 1);
    }
    return days;
  })();

  const addOpenShiftFromForm = async () => {
    const { date, startTime, endTime, department } = newShiftData;
    if (!startTime || !endTime || !department)
      return alert("All fields are required.");
    if (endTime <= startTime)
      return alert("End time must be after start time.");
    
    try {
      // Create shift in database
      const shiftRecord = await createShift({
        date,
        startTime,
        endTime,
        department,
      });
      
      // Convert to local Shift type and add to state
      const newShift: Shift = {
        id: shiftRecord.id,
        date: shiftRecord.date,
        startTime: shiftRecord.start_time,
        endTime: shiftRecord.end_time,
        worker: null,
        status: shiftRecord.status,
        department: shiftRecord.department,
      };
      
      setShifts((prev) => [newShift, ...prev]);
      setIsOpenShiftPanelOpen(false);
    } catch (error) {
      console.error("Failed to create shift:", error);
      alert("Failed to create shift. Please try again.");
    }
  };

  // --- Render Method ---
  return (
    <div className="space-y-6">
      {/* Calendar Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-6 w-6 text-gray-700" />
            <h2 className="text-xl font-semibold w-48 text-left">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="p-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((d, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg border cursor-pointer min-h-[80px] transition ${
                d.isSelected
                  ? "bg-blue-100 border-blue-300"
                  : "hover:bg-gray-50"
              } ${
                d.isCurrentMonth
                  ? "border-gray-200"
                  : "border-gray-100 text-gray-400"
              } ${d.isToday ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => {
                setSelectedDate(d.date);
                setNewShiftData((prev) => ({ ...prev, date: d.date }));
              }}
            >
              <div className="font-medium text-right">{d.day}</div>
              <div className="space-y-1 mt-1">
                {d.assignedShifts > 0 && (
                  <div className="text-xs bg-green-100 text-green-800 rounded px-1.5 py-0.5">
                    {d.assignedShifts} assigned
                  </div>
                )}
                {d.openShifts > 0 && (
                  <div className="text-xs bg-red-100 text-red-800 rounded px-1.5 py-0.5">
                    {d.openShifts} open
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift Details Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <h2 className="text-xl font-semibold">
              Shifts for{" "}
              {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                }
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadShiftsFromDatabase}
              className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-semibold text-sm"
            >
              Refresh
            </button>
            <button
              onClick={() => setIsOpenShiftPanelOpen(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-semibold"
            >
              Open New Shift
            </button>
          </div>
        </div>
        {getShiftsForDate(selectedDate).length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No shifts scheduled
            </h3>
            <p className="text-gray-600">Use &quot;Open New Shift&quot; to create one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {getShiftsForDate(selectedDate).map((shift) => (
              <div
                key={shift.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {shift.worker ? (
                        <User className="h-6 w-6 text-gray-600" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">
                          {formatTime(shift.startTime)} –{" "}
                          {formatTime(shift.endTime)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            shift.status
                          )}`}
                        >
                          {shift.status.replace("_", " ")}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getDepartmentColor(
                            shift.department
                          )}`}
                        >
                          {shift.department}
                        </span>
                      </div>
                      {shift.worker ? (
                        <div className="text-sm">
                          <p className="font-medium">{shift.worker.name}</p>
                          <p className="text-gray-600">{shift.worker.email}</p>
                        </div>
                      ) : (
                        <p className="text-red-600 font-medium">
                          No worker assigned
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Action Buttons Logic */}
                  <div className="flex items-center space-x-2 w-52 justify-end">
                    {loadingShifts.has(shift.id) ? (
                      <div className="px-4 py-2 flex items-center gap-2 text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        {shift.status === "open" && (
                          <button
                            onClick={() => broadcastShift(shift)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            <Bot className="h-4 w-4" />
                            Broadcast Shift
                          </button>
                        )}
                        {shift.status === "pending_response" && (
                          <button
                            onClick={() => handleAssignShift(shift)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            <Bot className="h-4 w-4" />
                            Check & Assign
                          </button>
                        )}
                        {shift.status === "assigned" && (
                          <div className="text-right text-sm text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            AI Assigned
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side Panel for New Shift */}
      {isOpenShiftPanelOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            aria-hidden="true"
            onClick={() => setIsOpenShiftPanelOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 flex max-w-md w-full bg-white shadow-lg p-6 z-50">
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Create Open Shift</h2>
                <button
                  onClick={() => setIsOpenShiftPanelOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Form Fields */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Date</span>
                <input
                  type="date"
                  value={newShiftData.date}
                  onChange={(e) =>
                    setNewShiftData({ ...newShiftData, date: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Start Time
                </span>
                <input
                  type="time"
                  value={newShiftData.startTime}
                  onChange={(e) =>
                    setNewShiftData({
                      ...newShiftData,
                      startTime: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  End Time
                </span>
                <input
                  type="time"
                  value={newShiftData.endTime}
                  onChange={(e) =>
                    setNewShiftData({
                      ...newShiftData,
                      endTime: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                />
              </label>
              <div className="space-y-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Department
                  </span>
                  <select
                    value={newShiftData.department}
                    onChange={(e) =>
                      setNewShiftData({
                        ...newShiftData,
                        department: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                  >
                    {departments.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Add new department"
                    className="flex-grow block w-full border-gray-300 rounded-md shadow-sm p-2"
                  />
                  <button
                    onClick={handleAddDepartment}
                    className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={addOpenShiftFromForm}
                  className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
                >
                  Save Shift
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
