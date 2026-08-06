import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/modules/admin/students/components/Toast";
import {
  getConversionHistory,
  getConversionDetail,
  exportConversionsCSV,
  exportConversionsExcel,
  exportConversionsPDF,
} from "@/services/conversionHistoryService";
import type { ConversionHistory as ConversionHistoryRecord, ConversionDetail } from "@/types/ConversionHistory";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import ConversionDetailModal from "./ConversionDetailModal";

export default function ConversionHistory() {
  const { showToast } = useToast();
  const [conversions, setConversions] = useState<ConversionHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ConversionDetail | null>(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadConversions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConversionHistory();
      setConversions(data);
    } catch {
      showToast("Failed to load conversion history", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    queueMicrotask(loadConversions);
  }, [loadConversions]);

  const handleViewDetail = async (id: number) => {
    setDetailId(id);
    try {
      const data = await getConversionDetail(id);
      setDetail(data);
    } catch {
      showToast("Failed to load conversion detail", "error");
    }
  };

  const handleCloseDetail = () => {
    setDetailId(null);
    setDetail(null);
  };

  const handleExportCSV = async () => {
    try {
      const blob = await exportConversionsCSV();
      downloadBlob(blob, "conversion-history.csv");
      showToast("CSV exported successfully", "success");
    } catch {
      showToast("Failed to export CSV", "error");
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await exportConversionsExcel();
      downloadBlob(blob, "conversion-history.xlsx");
      showToast("Excel exported successfully", "success");
    } catch {
      showToast("Failed to export Excel", "error");
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await exportConversionsPDF();
      downloadBlob(blob, "conversion-history.pdf");
      showToast("PDF exported successfully", "success");
    } catch {
      showToast("Failed to export PDF", "error");
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filtered = conversions.filter((c) => {
    if (search && !c.schoolName.toLowerCase().includes(search.toLowerCase()) && !c.conversionCode.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (dateFrom && c.conversionDate < dateFrom) return false;
    if (dateTo && c.conversionDate > dateTo) return false;
    return true;
  });

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Conversion History</h1>
            <p className="text-gray-500">Permanent audit log of all demo to paid conversions</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExportCSV} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Export CSV
            </button>
            <button onClick={handleExportExcel} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Export Excel
            </button>
            <button onClick={handleExportPDF} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Export PDF
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by school name or conversion code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full sm:w-80 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-[#234A91]/10"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-[#234A91]/10"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-[#234A91]/10"
            />
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No conversion history found.</div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-200">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Conversion Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">School Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Demo Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Paid School Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Converted By</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Conversion Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Amount</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((conv) => (
                    <tr key={conv.id} className="border-t border-slate-200 hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{conv.conversionCode}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{conv.schoolName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">DS-{String(conv.demoSchoolId).padStart(6, "0")}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">SCH-{String(conv.paidSchoolId).padStart(6, "0")}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{conv.convertedByName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{conv.conversionDate}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{conv.paymentAmount ? `NPR ${Number(conv.paymentAmount).toLocaleString()}` : "-"}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewDetail(conv.id)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {detailId && detail && (
        <ConversionDetailModal detail={detail} onClose={handleCloseDetail} />
      )}
    </SuperAdminLayout>
  );
}
