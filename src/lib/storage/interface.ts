export interface Storage {
	read(key: string): Promise<string | null>
	write(key: string, data: string): Promise<void>
	delete(key: string): Promise<void>
	list(prefix: string): Promise<string[]>
	exists(key: string): Promise<boolean>
}
