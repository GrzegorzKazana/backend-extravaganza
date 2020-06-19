export interface Repository<T, Id = string> {
    getById(id: Id): Promise<T>;
    exists(dto: T): Promise<boolean>;
    save(dto: T): Promise<T>;
    delete(id: Id): Promise<T>;
}
