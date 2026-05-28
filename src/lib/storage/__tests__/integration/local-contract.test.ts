import { mkdtemp, rm } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { LocalStorage } from "$lib/storage/local"
import { runStorageContractTests } from "../shared"

let tempDir: string

runStorageContractTests(
	"LocalStorage",
	async () => {
		tempDir = await mkdtemp(join(tmpdir(), "storage-contract-"))
		return new LocalStorage({ baseDir: tempDir })
	},
	async () => {
		await rm(tempDir, { recursive: true, force: true })
	},
)
