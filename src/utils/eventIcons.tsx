import { eventTypes } from "prisma/seed-data/data";
import {
  LucideIcon,
  Cake,
  Church,
  PartyPopper,
  Crown,
  Gem,
  Briefcase,
  Presentation,
  Projector,
  Users,
  HeartHandshake,
  Utensils,
} from "lucide-react";

export const eventIcons: Record<
  | (typeof eventTypes.corporate)[number]
  | (typeof eventTypes)["social function"][number],
  LucideIcon
> = {
  "business meeting": Briefcase,
  "conference/seminar": Presentation,
  convention: Users,
  "fellowship/team building": HeartHandshake,
  "luncheon/dinner": Utensils,
  "training: planning session": Projector,
  "birthday party": Cake,
  baptismal: Church,
  debut: Crown,
  "kids party": PartyPopper,
  wedding: Gem,
};
