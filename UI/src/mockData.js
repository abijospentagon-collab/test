export const initialStudents = [
  { id: "S101", name: "Aarav Sharma", class: "LKG", section: "A", age: 4, parentName: "Rajesh Sharma", parentPhone: "+91 98765 43210", email: "rajesh@example.com", status: "Active", enrollmentDate: "2025-06-15" },
  { id: "S102", name: "Mira Patel", class: "UKG", section: "B", age: 5, parentName: "Sneha Patel", parentPhone: "+91 98765 43211", email: "sneha@example.com", status: "Active", enrollmentDate: "2024-06-10" },
  { id: "S103", name: "Kabir Singh", class: "Play Group", section: "A", age: 3, parentName: "Jaspreet Singh", parentPhone: "+91 98765 43212", email: "jaspreet@example.com", status: "Active", enrollmentDate: "2025-08-01" },
  { id: "S104", name: "Ananya Rao", class: "Nursery", section: "A", age: 3.5, parentName: "Vikram Rao", parentPhone: "+91 98765 43213", email: "vikram@example.com", status: "Active", enrollmentDate: "2025-07-20" },
  { id: "S105", name: "Reyansh Gupta", class: "LKG", section: "B", age: 4.5, parentName: "Amit Gupta", parentPhone: "+91 98765 43214", email: "amit@example.com", status: "Active", enrollmentDate: "2025-06-18" },
  { id: "S106", name: "Diya Iyer", class: "UKG", section: "A", age: 5.5, parentName: "Raman Iyer", parentPhone: "+91 98765 43215", email: "raman@example.com", status: "Inactive", enrollmentDate: "2024-06-12" },
  { id: "S107", name: "Zayan Khan", class: "Nursery", section: "B", age: 3.5, parentName: "Farhan Khan", parentPhone: "+91 98765 43216", email: "farhan@example.com", status: "Active", enrollmentDate: "2025-07-22" },
  { id: "S108", name: "Abhi Kumar", class: "LKG", section: "A", age: 4.5, parentName: "Surendra Kumar", parentPhone: "+91 98765 43217", email: "surendra@example.com", status: "Active", enrollmentDate: "2025-06-20" }
];

export const initialStaff = [
  { id: "ST201", name: "Priya Sen", role: "Teacher", contact: "+91 99999 11111", email: "priya.teacher@sorted.edu", status: "Active", assignedArea: "LKG - Section A" },
  { id: "ST202", name: "Rohan Das", role: "Admin", contact: "+91 99999 22222", email: "rohan.admin@sorted.edu", status: "Active", assignedArea: "Main Office" },
  { id: "ST203", name: "Savitri Devi", role: "Support Staff", contact: "+91 99999 33333", email: "savitri.support@sorted.edu", status: "Active", assignedArea: "Cleanliness & Play Areas" },
  { id: "ST204", name: "Anita Kapoor", role: "Teacher", contact: "+91 99999 44444", email: "anita.teacher@sorted.edu", status: "Active", assignedArea: "UKG - Section B" },
  { id: "ST205", name: "Ramesh Kumar", role: "Support Staff", contact: "+91 99999 55555", email: "ramesh.support@sorted.edu", status: "Active", assignedArea: "Kitchen & Maintenance" }
];

export const initialInventory = [
  { id: "INV301", name: "Safety Scissors", category: "Replaceable items", stockLevel: 25, minStockLevel: 5, unit: "units" },
  { id: "INV302", name: "Paper Glue Sticks", category: "Replaceable items", stockLevel: 4, minStockLevel: 8, unit: "sticks" },
  { id: "INV303", name: "Colored Chart Paper", category: "Teaching aids", stockLevel: 150, minStockLevel: 30, unit: "sheets" },
  { id: "INV304", name: "Non-Toxic Hand Wash", category: "Cleaning items", stockLevel: 3, minStockLevel: 5, unit: "bottles" },
  { id: "INV305", name: "Sketch Pens Set", category: "Replaceable items", stockLevel: 35, minStockLevel: 10, unit: "packs" },
  { id: "INV306", name: "Disinfectant Wipes", category: "Cleaning items", stockLevel: 12, minStockLevel: 4, unit: "tubs" },
  { id: "INV307", name: "Building Block Sets", category: "Teaching aids", stockLevel: 15, minStockLevel: 3, unit: "boxes" }
];

export const initialTasks = [
  { id: "T401", title: "Sanitize Play Area Blocks", description: "Wipe down all plastic blocks in the Play Group area with disinfectant.", assignedTo: "ST203", priority: "High", status: "Pending", dueDate: "2026-05-26", category: "Cleaning" },
  { id: "T402", title: "Review UKG Math Lesson Plans", description: "Make sure addition worksheets are ready for next week's classes.", assignedTo: "ST201", priority: "Medium", status: "In Progress", dueDate: "2026-05-28", category: "Teaching" },
  { id: "T403", title: "Repair Playground Swing Link", description: "Fix the squeaky and loose chain on the middle swing.", assignedTo: "ST205", priority: "High", status: "Pending", dueDate: "2026-05-25", category: "Maintenance" },
  { id: "T404", title: "Stock Audit", description: "Audit stock levels for chart paper, scissors, and handwash.", assignedTo: "ST202", priority: "Low", status: "Done", dueDate: "2026-05-24", category: "General" }
];

export const initialActivities = [
  { id: "ACT501", name: "Origami Animal Crafts", description: "Fold basic frogs and dogs using colorful chart paper.", class: "LKG", materials: ["Colored Chart Paper", "Safety Scissors"], scheduledDateTime: "2026-05-26T10:00", isFavorite: true },
  { id: "ACT502", name: "Alphabet Painting", description: "Finger paint the alphabet on paper sheets to learn shapes.", class: "Play Group", materials: ["Colored Chart Paper"], scheduledDateTime: "2026-05-27T09:30", isFavorite: false },
  { id: "ACT503", name: "Collage Making", description: "Stick scrap papers to construct a house model.", class: "UKG", materials: ["Colored Chart Paper", "Paper Glue Sticks", "Safety Scissors"], scheduledDateTime: "2026-05-28T11:00", isFavorite: true }
];

export const initialEvents = [
  { id: "EV601", title: "Summer Activity Camp", date: "2026-06-01", status: "Upcoming", description: "A week-long series of crafts, games, and music for children." },
  { id: "EV602", title: "Parent-Teacher Meeting", date: "2026-05-30", status: "Upcoming", description: "Discussion on progress cards and class promotions." },
  { id: "EV603", title: "Preschool Science Fair", date: "2026-05-25", status: "Ongoing", description: "Showcasing simple scientific models by UKG students." }
];

export const initialMessages = {
  templates: [
    { type: "Event Reminder", subject: "Upcoming Science Fair", content: "Dear parents, please join us today at 11 AM for the Preschool Science Fair in the Main Hall. Your encouragement means the world to our little scientists!" },
    { type: "Fee Reminder", subject: "Monthly Tuition Fee Due", content: "Dear Parents, this is a friendly reminder that the tuition fee for the current month is due by the 5th. Kindly ignore if already paid. Thank you!" },
    { type: "Announcement", subject: "Emergency Weather Closure", content: "Dear Parents and Staff, school will remain closed tomorrow due to heavy rainfall warnings. Online engagement activities will be shared by teachers." }
  ],
  conversations: [
    {
      studentId: "S101",
      parentName: "Rajesh Sharma",
      studentName: "Aarav Sharma",
      messages: [
        { sender: "parent", text: "Hello Admin, will Aarav have his medical checkup tomorrow?", timestamp: "2026-05-24T14:30:00" },
        { sender: "admin", text: "Yes, Rajesh. The medical team will be visiting during the morning session. Please ensure he has his health card.", timestamp: "2026-05-24T15:00:00" }
      ]
    },
    {
      studentId: "S102",
      parentName: "Sneha Patel",
      studentName: "Mira Patel",
      messages: [
        { sender: "admin", text: "Hello Sneha, we noticed Mira has a mild cough today. Please let us know if she requires medication.", timestamp: "2026-05-25T11:20:00" },
        { sender: "parent", text: "Thank you for the update. I have placed a cough syrup in her bag, please give her 5ml after lunch.", timestamp: "2026-05-25T11:45:00" }
      ]
    }
  ]
};

export const initialAttendance = {
  students: [
    { date: "2026-05-25", studentId: "S101", status: "Present", remarks: "" },
    { date: "2026-05-25", studentId: "S102", status: "Present", remarks: "" },
    { date: "2026-05-25", studentId: "S103", status: "Half Day", remarks: "Doctor appointment" },
    { date: "2026-05-25", studentId: "S104", status: "Absent", remarks: "Fever" },
    { date: "2026-05-25", studentId: "S105", status: "Present", remarks: "" },
    { date: "2026-05-25", studentId: "S107", status: "Early Departure", remarks: "Picked up by mother at 12 PM" }
  ],
  staff: [
    { date: "2026-05-25", staffId: "ST201", checkIn: "08:15 AM", checkOut: "", status: "Present" },
    { date: "2026-05-25", staffId: "ST202", checkIn: "07:55 AM", checkOut: "", status: "Present" },
    { date: "2026-05-25", staffId: "ST203", checkIn: "08:00 AM", checkOut: "", status: "Present" },
    { date: "2026-05-25", staffId: "ST204", checkIn: "08:20 AM", checkOut: "", status: "Present" },
    { date: "2026-05-25", staffId: "ST205", checkIn: "", checkOut: "", status: "Absent" }
  ]
};
