import { requireModule } from "@/lib/guards";
import { FormsList } from "@/components/admin/FormsList";
import { listFormSubmissions } from "@/lib/queries/forms";
import { FormsPageHeader } from "@/components/admin/FormsPageHeader";

export default async function FormsPage() {
  await requireModule("forms");
  const submissions = await listFormSubmissions({ limit: 100 });

  return (
    <div className="space-y-6">
      <FormsPageHeader />
      <FormsList initial={submissions} />
    </div>
  );
}
