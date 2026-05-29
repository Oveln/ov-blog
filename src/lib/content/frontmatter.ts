import type { PostFrontmatter } from "./schema"

export function serializeFrontmatter(data: PostFrontmatter): string {
	const lines = [
		"---",
		`title: "${data.title.replace(/"/g, '\\"')}"`,
		`description: "${data.description.replace(/"/g, '\\"')}"`,
		`tags:`,
		...data.tags.map((t) => `  - "${t}"`),
		`createdAt: "${data.createdAt}"`,
	]
	if (data.updatedAt) {
		lines.push(`updatedAt: "${data.updatedAt}"`)
	}
	lines.push("---", "")
	return lines.join("\n")
}
