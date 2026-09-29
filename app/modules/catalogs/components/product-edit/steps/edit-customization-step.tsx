import { ModifierGroupDraftEditor } from "../../product-wizard/modifier-group-draft-editor"
import { WizardStepShell } from "../../product-wizard/wizard-step-shell"
import type { GroupDraft } from "../../../types"

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
