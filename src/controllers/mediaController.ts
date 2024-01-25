import {connect, Row} from "../database/connect";

export async function saveEntry(mediaId: number, exclude: boolean, success: boolean) {
    const database = await connect();
    await database.run("INSERT INTO media (id, exclude, success) VALUES (?, ?, ?)", [mediaId, exclude, success]);
}

export async function getEntry(id: number) {
    const database = await connect();
    return await database.get<Row>("SELECT * FROM media WHERE id = ?", id);
}

export async function getEntries() {
    const database = await connect();
    return await database.all<Row[]>("SELECT * FROM media");
}
