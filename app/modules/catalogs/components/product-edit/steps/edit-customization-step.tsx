import { ModifierGroupDraftEditor } from "../../product-wizard/modifier-group-draft-editor"
import { WizardStepShell } from "../../product-wizard/wizard-step-shell"
import type { GroupDraft } from "../../../types"

/**
 * The customization step of an edit, over the same editor the create wizard
 * uses. A group that is already on the product carries its server id, so the
 * save can tell an edited group from a new one and an option that is gone from
 * one that never existed.
 */
export function EditCustomizationStep({
    groups,
    onChange,
}: {
    groups: GroupDraft[]
    onChange: (groups: GroupDraft[]) => void
}) {
    return (
        <WizardStepShell
            title="Customization"
            description="Ubah pilihan yang dapat dipilih pelanggan, atau tambahkan yang baru (opsional)"
        >
            <ModifierGroupDraftEditor groups={groups} onChange={onChange} mode="edit" />
        </WizardStepShell>
    )
}
