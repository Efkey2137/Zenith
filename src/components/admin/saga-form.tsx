"use client";
import { useActionState } from "react";
import { createSagaAction } from "@/lib/actions/sagas";
interface Saga {
  id: number;
  title: string;
  slug: string;
  order: number;
  description: string | null;
}
export function SagaForm({ saga }: { saga?: Saga }) {
  const [state, action, pending] = useActionState(
    async (_prev: { success: boolean; message: string }, data: FormData) => {
      const result = await createSagaAction(data);
      return {
        success: result.success,
        message: result.success ? "Saga została zapisana." : result.error,
      };
    },
    { success: false, message: "" },
  );
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={saga?.id ?? ""} />
      <label className="block">
        <span className="field-label">Tytuł</span>
        <input
          className="field"
          name="title"
          defaultValue={saga?.title}
          required
          maxLength={200}
        />
      </label>
      <label className="block">
        <span className="field-label">
          Adres sagi {saga ? "(stały)" : "(opcjonalnie)"}
        </span>
        <input
          className="field"
          name="slug"
          defaultValue={saga?.slug}
          readOnly={!!saga}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          maxLength={160}
        />
      </label>
      <label className="block">
        <span className="field-label">Kolejność (np. 10, 20, 30)</span>
        <input
          className="field"
          name="order"
          type="number"
          min="0"
          step="1"
          defaultValue={saga?.order ?? 10}
          required
        />
      </label>
      <label className="block">
        <span className="field-label">Opis</span>
        <textarea
          className="field"
          name="description"
          defaultValue={saga?.description ?? ""}
          rows={5}
          maxLength={10000}
        />
      </label>
      <button className="primary-button" disabled={pending}>
        {pending ? "Zapisywanie…" : saga ? "Zapisz zmiany" : "Dodaj sagę"}
      </button>
      <p
        role="status"
        className={`text-sm ${state.success ? "text-emerald-300" : "text-red-300"}`}
      >
        {state.message}
      </p>
    </form>
  );
}
