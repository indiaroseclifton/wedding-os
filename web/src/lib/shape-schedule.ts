import type { WeddingShape } from "./shape";

export type ShapeSlot = {
  time: string;
  endTime?: string;
  title: string;
  location?: string;
  lead?: string;
  audiences: Array<"couple" | "party" | "vendor" | "guests">;
  notes?: string;
};

export const SHAPE_SCHEDULES: Record<Exclude<WeddingShape, "weekend">, ShapeSlot[]> = {
  us: [
    {
      time: "09:00",
      endTime: "09:30",
      title: "Meet the photographer",
      location: "Wherever we’re standing",
      lead: "Photo",
      audiences: ["couple", "vendor"],
    },
    {
      time: "09:30",
      endTime: "10:00",
      title: "Vows",
      location: "The place we chose",
      lead: "Couple",
      audiences: ["couple", "vendor"],
      notes: "No aisle unless you asked for one.",
    },
    {
      time: "10:00",
      endTime: "10:20",
      title: "License",
      lead: "Couple",
      audiences: ["couple"],
      notes: "Who keeps the paper until it’s filed.",
    },
    {
      time: "10:20",
      endTime: "11:30",
      title: "Portraits",
      lead: "Photo",
      audiences: ["couple", "vendor"],
    },
    {
      time: "12:00",
      endTime: "14:00",
      title: "Lunch, or go",
      lead: "Couple",
      audiences: ["couple"],
    },
  ],
  small: [
    {
      time: "14:00",
      endTime: "15:00",
      title: "Getting ready",
      lead: "Couple",
      audiences: ["couple"],
    },
    {
      time: "15:00",
      endTime: "15:45",
      title: "Portraits",
      lead: "Photo",
      audiences: ["couple", "vendor"],
    },
    {
      time: "16:00",
      endTime: "16:25",
      title: "Ceremony",
      lead: "Officiant",
      audiences: ["couple", "vendor", "guests"],
    },
    {
      time: "16:30",
      endTime: "18:30",
      title: "Dinner in the same room",
      lead: "Kitchen",
      audiences: ["couple", "vendor", "guests"],
    },
  ],
  two: [
    {
      time: "10:00",
      endTime: "10:30",
      title: "Marrying day — vows",
      lead: "Couple",
      audiences: ["couple", "vendor"],
      notes: "The gathering has its own plan later.",
    },
    {
      time: "10:30",
      endTime: "10:45",
      title: "License",
      lead: "Couple",
      audiences: ["couple"],
    },
    {
      time: "10:45",
      endTime: "12:00",
      title: "Portraits",
      lead: "Photo",
      audiences: ["couple", "vendor"],
    },
  ],
};
