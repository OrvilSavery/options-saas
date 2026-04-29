import { notFound } from "next/navigation";
import { ensureUserRecord } from "@/lib/auth";
import { getAnalysisRunById } from "@/lib/analysis-history/getAnalysisRunById";
import HistoryDetailClientPage from "@/components/history/HistoryDetailClientPage";

export default async function AnalysisRunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await ensureUserRecord();

  if (!user) {
    notFound();
  }

  const run = await getAnalysisRunById(user.id, id);

  if (!run) {
    notFound();
  }

  return <HistoryDetailClientPage run={run} />;
}