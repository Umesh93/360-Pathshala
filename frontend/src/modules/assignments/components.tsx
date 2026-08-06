import { Download, Eye, FileText } from "lucide-react";
import { useToast } from "../admin/students/components/Toast";
import * as service from "./service";
import type {
  Assignment,
  Attachment,
  Submission,
  SubmissionStatus,
} from "./types";
import { titleCase } from "./ui";

export function FieldLabel({
  name,
  required = false,
}: {
  name: string;
  required?: boolean;
}) {
  return (
    <span className="block text-sm font-medium text-gray-700">
      {name}
      {required && <span className="ml-1 text-red-600">*</span>}
    </span>
  );
}

export function StatusBadge({
  status,
}: {
  status?: SubmissionStatus | Assignment["status"];
}) {
  const value = status ?? "PENDING";
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING: "bg-amber-50 text-amber-700",
    PUBLISHED: "bg-blue-50 text-blue-700",
    ACTIVE: "bg-green-50 text-green-700",
    SUBMITTED: "bg-sky-50 text-sky-700",
    LATE: "bg-orange-50 text-orange-700",
    REVIEWED: "bg-violet-50 text-violet-700",
    RETURNED: "bg-red-50 text-red-700",
    GRADED: "bg-emerald-50 text-emerald-700",
    CLOSED: "bg-gray-100 text-gray-700",
    ARCHIVED: "bg-slate-200 text-slate-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[value] ?? colors.PENDING}`}
    >
      {titleCase(value)}
    </span>
  );
}

export function AttachmentLinks({
  assignmentId,
  submission,
  attachments,
}: {
  assignmentId: number;
  submission?: Submission;
  attachments: Attachment[];
}) {
  const { showToast } = useToast();
  const fetchFile = (attachment: Attachment) =>
    submission?.id
      ? service.getSubmissionAttachment(
          assignmentId,
          submission.id,
          attachment.key,
        )
      : service.getAssignmentAttachment(assignmentId, attachment.key);
  const action = async (attachment: Attachment, preview: boolean) => {
    try {
      const blob = await fetchFile(attachment);
      if (preview) await service.previewBlob(blob);
      else service.downloadBlob(blob, attachment.originalName);
    } catch (error) {
      showToast(service.assignmentError(error), "error");
    }
  };
  if (!attachments.length)
    return <span className="text-sm text-gray-400">No files</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => {
        const previewable =
          attachment.contentType.startsWith("image/") ||
          attachment.contentType === "application/pdf";
        return (
          <span
            key={attachment.key}
            className="inline-flex items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-xs"
          >
            <span
              className="flex max-w-48 items-center gap-1 truncate px-2 py-1.5"
              title={attachment.originalName}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />{" "}
              {attachment.originalName}
            </span>
            {previewable && (
              <button
                type="button"
                className="border-l p-1.5 text-[#234A91] hover:bg-blue-50"
                title="Preview"
                onClick={() => action(attachment, true)}
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              className="border-l p-1.5 text-[#234A91] hover:bg-blue-50"
              title="Download"
              onClick={() => action(attachment, false)}
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </span>
        );
      })}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="p-10 text-center text-sm text-gray-500">{text}</div>;
}
