import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, ClockIcon, ArrowRightIcon } from "lucide-react";

interface MitigationActionsListProps {
  actions: string[];
}

export default function MitigationActionsList({
  actions,
}: MitigationActionsListProps) {
  // Track status of each action: 'pending', 'in-progress', 'completed'
  const [actionStatuses, setActionStatuses] = useState<{
    [key: string]: "pending" | "in-progress" | "completed";
  }>(
    actions.reduce(
      (acc, action) => ({
        ...acc,
        [action]: "pending",
      }),
      {}
    )
  );

  // Change status of an action
  const changeStatus = (
    action: string,
    newStatus: "pending" | "in-progress" | "completed"
  ) => {
    setActionStatuses({
      ...actionStatuses,
      [action]: newStatus,
    });
  };

  // Get status badge
  const getStatusBadge = (status: "pending" | "in-progress" | "completed") => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500 text-white ml-2">
            <CheckIcon className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-500 text-white ml-2">
            <ClockIcon className="h-3 w-3 mr-1" /> In Progress
          </Badge>
        );
      case "pending":
      default:
        return <Badge className="bg-gray-500 text-white ml-2">Pending</Badge>;
    }
  };

  // Calculate progress percentage
  const completedCount = Object.values(actionStatuses).filter(
    (status) => status === "completed"
  ).length;
  const inProgressCount = Object.values(actionStatuses).filter(
    (status) => status === "in-progress"
  ).length;
  const progressPercentage = Math.round(
    ((completedCount + inProgressCount * 0.5) / actions.length) * 100
  );

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Implementation Progress</span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {completedCount} completed, {inProgressCount} in progress
          </span>
          <span>{actions.length} total</span>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {actions.map((action, index) => (
          <div
            key={action}
            className={`p-3 border rounded-md transition-all ${
              actionStatuses[action] === "completed"
                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                : actionStatuses[action] === "in-progress"
                ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                : "bg-muted/5"
            }`}
          >
            <div className="flex items-start gap-2">
              <Checkbox
                id={`action-${index}`}
                checked={actionStatuses[action] === "completed"}
                onCheckedChange={(checked) => {
                  if (checked) {
                    changeStatus(action, "completed");
                  } else {
                    changeStatus(action, "pending");
                  }
                }}
              />
              <div className="space-y-1">
                <label
                  htmlFor={`action-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {action}
                </label>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {getStatusBadge(actionStatuses[action])}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-2 flex gap-2 justify-end">
              {actionStatuses[action] === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeStatus(action, "in-progress")}
                >
                  <ArrowRightIcon className="h-3 w-3 mr-1" /> Start
                </Button>
              )}

              {actionStatuses[action] === "in-progress" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeStatus(action, "completed")}
                  className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/40"
                >
                  <CheckIcon className="h-3 w-3 mr-1" /> Complete
                </Button>
              )}

              {actionStatuses[action] !== "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeStatus(action, "pending")}
                  className="bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-900/20 dark:text-gray-300 dark:hover:bg-gray-900/40"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
