/** Core domain types for Phase 1 / Stage 0–1 */

export type MembershipRole = "COUPLE" | "WEDDING_PARTY";

export type DecisionStatus = "EXPLORING" | "DECIDED" | "NEEDS_REVISIT";

export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "BLOCKED";

export type PackageStatus = "DRAFT" | "SHARED";

export type DecisionType = "PRIORITIES" | "STYLE_VIBE" | "VENUE_TYPE";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

export interface Membership {
  id: string;
  workspaceId: string;
  userId: string;
  role: MembershipRole;
  status: "ACTIVE" | "PENDING";
  createdAt: string;
}

export interface DecisionRecord {
  id: string;
  workspaceId: string;
  type: DecisionType;
  title: string;
  status: DecisionStatus;
  summary: string;
  payload: Record<string, unknown>;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  ownerId: string;
  status: TaskStatus;
  dueDate?: string;
  decisionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invite {
  id: string;
  workspaceId: string;
  email?: string;
  token: string;
  role: MembershipRole;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  createdAt: string;
}
