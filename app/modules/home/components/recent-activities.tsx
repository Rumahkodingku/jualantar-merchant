import { Card, CardContent } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import type { ActivityItem } from "../types/home.types"

export function RecentActivities({ activities }: { activities: ActivityItem[] }) {
    return (
        <section aria-label="Aktivitas terbaru" className="flex flex-col gap-2">
            <Text as="h2" variant="sm" weight="semibold">
                Aktivitas Terbaru
            </Text>

            <Card>
                <CardContent className="flex flex-col">
                    {activities.map((activity, index) => (
                        <div key={activity.id} className="flex gap-3">
                            <div className="flex flex-col items-center" aria-hidden="true">
                                <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary" />
                                {index < activities.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-4 last:pb-0">
                                <Text as="p" variant="sm" weight="medium">
                                    {activity.title}
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    {activity.description}
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    {activity.createdAt}
                                </Text>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </section>
    )
}
