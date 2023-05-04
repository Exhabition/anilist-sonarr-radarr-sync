import { Row, connect } from "../database/connect";

export async function saveEntry(mediaId: number, exclude: boolean, success: boolean) {
    const database = await connect();
    await database.run("INSERT INTO media (id, exclude, success) VALUES (?, ?, ?)", [mediaId, exclude, success]);
}

export async function getEntry(id: number) {
    const database = await connect();
    const result = await database.get<Row>("SELECT * FROM media WHERE id = ?", id);

    return result;
}

export async function getEntries() {
    const database = await connect();
    const rows = await database.all<Row[]>("SELECT * FROM media");

    return rows;
}