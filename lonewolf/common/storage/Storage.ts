import type Board from '@/common/data/Board'

export interface IStorage{
    save(borad: Board): Promise<void>
    saveAs(borad: Board): Promise<void>
    load(): Promise<Board>
    list(): Promise<IStorageEntry[]>
    isListable(): boolean
}

export interface IStorageEntry {
    name: string
}

