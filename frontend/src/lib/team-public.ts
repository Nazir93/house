/** Нормализация и проверка данных сотрудника (админка → сайт). */

export function normalizeTeamMemberInput(input: {
  name?: string;
  position?: string;
  photoUrl?: string;
  description?: string;
  visible?: boolean;
  order?: number;
}) {
  return {
    name: input.name?.trim() ?? "",
    position: input.position?.trim() ?? "",
    photoUrl: input.photoUrl?.trim() || null,
    description: input.description?.trim() || null,
    visible: input.visible ?? true,
    order: typeof input.order === "number" && Number.isFinite(input.order) ? input.order : 0,
  };
}

export function isTeamMemberInputValid(input: ReturnType<typeof normalizeTeamMemberInput>): boolean {
  return input.name.length >= 2 && input.position.length >= 2;
}

/** Объединение частичного PATCH с существующей записью. */
export function mergeTeamMemberPatch(
  existing: ReturnType<typeof normalizeTeamMemberInput>,
  patch: ReturnType<typeof normalizeTeamMemberInput>,
  touched: Partial<Record<keyof ReturnType<typeof normalizeTeamMemberInput>, boolean>>
): ReturnType<typeof normalizeTeamMemberInput> {
  return {
    name: touched.name ? patch.name : existing.name,
    position: touched.position ? patch.position : existing.position,
    photoUrl: touched.photoUrl ? patch.photoUrl : existing.photoUrl,
    description: touched.description ? patch.description : existing.description,
    visible: touched.visible ? patch.visible : existing.visible,
    order: touched.order ? patch.order : existing.order,
  };
}
